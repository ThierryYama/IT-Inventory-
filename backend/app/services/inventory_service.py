from tortoise.backends.base.client import BaseDBAsyncClient
from tortoise.expressions import Q
from tortoise.transactions import in_transaction

from app.models.asset import Asset
from app.models.island import Island
from app.models.sector import Sector
from app.schemas.inventory import InventoryImportResponseSchema
from app.services.asset_service import buildAssetValues, getOrCreateSectorByName, rebalanceSectorIslands
from app.services.history_service import recordAssetHistory
from app.utils.spreadsheet import SpreadsheetAssetRow, parseSpreadsheetRows


async def bulkImportInventory(*, file_name: str, file_bytes: bytes) -> InventoryImportResponseSchema:
    rows: list[SpreadsheetAssetRow] = parseSpreadsheetRows(file_name=file_name, file_bytes=file_bytes)
    created_count: int = 0
    updated_count: int = 0
    affected_sector_ids: set[int] = set()
    async with in_transaction() as connection:
        for row in rows:
            sector: Sector = await getOrCreateSectorByName(row.sector_name, connection)
            asset: Asset | None = await findExistingAssetForImport(row=row, connection=connection)
            asset_values: dict[str, object] = buildAssetValues(
                {
                    'name': row.name,
                    'ip_address': row.ip_address,
                    'mac_address': row.mac_address,
                    'wifi_mac_address': row.wifi_mac_address,
                    'model_name': row.model_name,
                    'user_name': row.user_name,
                    'processor': row.processor,
                    'memory': row.memory,
                    'storage': row.storage,
                    'brand': row.brand,
                    'part_number': row.part_number,
                    'patrimony': row.patrimony,
                    'desktop_name': row.desktop_name,
                    'asset_type': row.asset_type,
                    'operating_system': row.operating_system,
                }
            )
            if asset is None:
                asset = await Asset.create(
                    **asset_values,
                    sector_id=sector.id,
                    island_id=None,
                    slot_index=None,
                    using_db=connection,
                )
                created_count += 1
                await recordAssetHistory(
                    asset_id=asset.id,
                    event_type='import',
                    details={'mode': 'create', 'file_name': file_name},
                    connection=connection,
                )
            else:
                previous_sector_id: int = asset.sector_id
                for field_name, field_value in asset_values.items():
                    setattr(asset, field_name, field_value)
                asset.sector_id = sector.id
                asset.island_id = None
                asset.slot_index = None
                await asset.save(using_db=connection)
                updated_count += 1
                affected_sector_ids.add(previous_sector_id)
                await recordAssetHistory(
                    asset_id=asset.id,
                    event_type='import',
                    details={'mode': 'update', 'file_name': file_name},
                    connection=connection,
                )
            affected_sector_ids.add(sector.id)
        for sector_id in affected_sector_ids:
            await rebalanceSectorIslands(sector_id, connection)
        sector_count: int = await Sector.all().using_db(connection).count()
        island_count: int = await Island.all().using_db(connection).count()
    return InventoryImportResponseSchema(
        file_name=file_name,
        total_rows=len(rows),
        created_count=created_count,
        updated_count=updated_count,
        sector_count=sector_count,
        island_count=island_count,
    )


async def findExistingAssetForImport(*, row: SpreadsheetAssetRow, connection: BaseDBAsyncClient) -> Asset | None:
    if row.patrimony:
        asset: Asset | None = await Asset.filter(patrimony__iexact=row.patrimony).using_db(connection).get_or_none()
        if asset:
            return asset
    if row.mac_address:
        asset = await Asset.filter(mac_address__iexact=row.mac_address).using_db(connection).get_or_none()
        if asset:
            return asset
    if row.desktop_name:
        asset = await Asset.filter(desktop_name__iexact=row.desktop_name).using_db(connection).get_or_none()
        if asset:
            return asset
    return await (
        Asset.filter(Q(name__iexact=row.name) & Q(sector__name__iexact=row.sector_name))
        .using_db(connection)
        .get_or_none()
    )
