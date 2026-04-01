from fastapi import HTTPException, status
from tortoise.backends.base.client import BaseDBAsyncClient
from tortoise.expressions import Q
from tortoise.transactions import in_transaction

from app.models.asset import Asset
from app.models.history import AssetHistory
from app.models.island import ISLAND_CAPACITY, Island
from app.models.sector import Sector
from app.schemas.asset import AssetCreateSchema, AssetMoveSchema, AssetUpdateSchema
from app.schemas.island import IslandCreateSchema
from app.services.history_service import recordAssetHistory
from app.utils.text import normalizeOptionalText


def buildAssetSnapshot(asset: Asset) -> dict[str, object]:
    return {
        'id': asset.id,
        'name': asset.name,
        'ip_address': asset.ip_address,
        'mac_address': asset.mac_address,
        'wifi_mac_address': asset.wifi_mac_address,
        'model_name': asset.model_name,
        'user_name': asset.user_name,
        'processor': asset.processor,
        'memory': asset.memory,
        'storage': asset.storage,
        'brand': asset.brand,
        'part_number': asset.part_number,
        'patrimony': asset.patrimony,
        'desktop_name': asset.desktop_name,
        'asset_type': asset.asset_type,
        'operating_system': asset.operating_system,
        'sector_id': asset.sector_id,
        'sector_name': asset.sector.name if asset.sector else None,
        'island_id': asset.island_id,
        'island_sequence_number': asset.island.sequence_number if asset.island else None,
        'slot_index': asset.slot_index,
    }


async def assignAssetToNextAvailableSlot(asset: Asset, connection: BaseDBAsyncClient) -> None:
    islands: list[Island] = await Island.filter(sector_id=asset.sector_id).order_by('sequence_number').using_db(connection)
    for island in islands:
        occupied_slots: set[int] = set(
            await Asset.filter(island_id=island.id).exclude(id=asset.id).using_db(connection).values_list('slot_index', flat=True)
        )
        for slot_index in range(1, island.capacity + 1):
            if slot_index in occupied_slots:
                continue
            asset.island_id = island.id
            asset.slot_index = slot_index
            await asset.save(using_db=connection, update_fields=['island_id', 'slot_index', 'updated_at'])
            return
    next_sequence_number: int = await getNextIslandSequenceNumber(asset.sector_id, connection)
    island: Island = await Island.create(
        sector_id=asset.sector_id,
        sequence_number=next_sequence_number,
        capacity=ISLAND_CAPACITY,
        using_db=connection,
    )
    asset.island_id = island.id
    asset.slot_index = 1
    await asset.save(using_db=connection, update_fields=['island_id', 'slot_index', 'updated_at'])


async def cleanupSectorIslands(sector_id: int, connection: BaseDBAsyncClient) -> None:
    return None


async def createManualIsland(sector_name: str, payload: IslandCreateSchema) -> Island:
    async with in_transaction() as connection:
        sector: Sector = await getOrCreateSectorByName(sector_name, connection)
        next_sequence_number: int = await getNextIslandSequenceNumber(sector.id, connection)
        island: Island = await Island.create(
            sector_id=sector.id,
            sequence_number=next_sequence_number,
            capacity=payload.capacity,
            using_db=connection,
        )
    return island


async def deleteEmptyIsland(island_id: int) -> None:
    async with in_transaction() as connection:
        island: Island | None = await Island.filter(id=island_id).using_db(connection).get_or_none()
        if island is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Ilha nao encontrada.')
        asset_count: int = await Asset.filter(island_id=island.id).using_db(connection).count()
        if asset_count > 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Apenas ilhas vazias podem ser excluidas.')
        sector_id: int = island.sector_id
        await island.delete(using_db=connection)
        await resequenceSectorIslands(sector_id, connection)


async def createAsset(payload: AssetCreateSchema) -> Asset:
    async with in_transaction() as connection:
        sector: Sector = await getOrCreateSectorByName(payload.sector_name, connection)
        asset: Asset = await Asset.create(
            **buildAssetValues(payload.model_dump(exclude={'sector_name'})),
            sector_id=sector.id,
            island_id=None,
            slot_index=None,
            using_db=connection,
        )
        await assignAssetToNextAvailableSlot(asset, connection)
        await asset.fetch_related('sector', 'island')
        await recordAssetHistory(
            asset_id=asset.id,
            event_type='create',
            details={'asset': buildAssetSnapshot(asset)},
            connection=connection,
        )
    return await getAssetById(asset.id)


async def deleteAsset(asset_id: int) -> None:
    async with in_transaction() as connection:
        asset: Asset = await getAssetOrFail(asset_id, connection)
        sector_id: int = asset.sector_id
        await asset.delete(using_db=connection)
        await cleanupSectorIslands(sector_id, connection)


async def getAssetById(asset_id: int) -> Asset:
    asset: Asset | None = await (
        Asset.filter(id=asset_id)
        .select_related('sector', 'island')
        .get_or_none()
    )
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Ativo nao encontrado.')
    return asset


async def getAssetHistory(asset_id: int) -> list:
    await getAssetById(asset_id)
    return await AssetHistory.filter(asset_id=asset_id).order_by('-created_at', '-id')


async def getAssetOrFail(asset_id: int, connection: BaseDBAsyncClient) -> Asset:
    asset: Asset | None = await (
        Asset.filter(id=asset_id)
        .select_related('sector', 'island')
        .using_db(connection)
        .get_or_none()
    )
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Ativo nao encontrado.')
    return asset


async def getOrCreateIsland(
    *,
    sector_id: int,
    sequence_number: int,
    connection: BaseDBAsyncClient,
) -> Island:
    island: Island | None = await (
        Island.filter(sector_id=sector_id, sequence_number=sequence_number)
        .using_db(connection)
        .get_or_none()
    )
    if island:
        return island
    return await Island.create(
        sector_id=sector_id,
        sequence_number=sequence_number,
        capacity=ISLAND_CAPACITY,
        using_db=connection,
    )


async def getNextIslandSequenceNumber(sector_id: int, connection: BaseDBAsyncClient) -> int:
    last_island: Island | None = await (
        Island.filter(sector_id=sector_id)
        .order_by('-sequence_number')
        .using_db(connection)
        .first()
    )
    if last_island is None:
        return 1
    return last_island.sequence_number + 1


async def resequenceSectorIslands(sector_id: int, connection: BaseDBAsyncClient) -> None:
    islands: list[Island] = await (
        Island.filter(sector_id=sector_id)
        .order_by('sequence_number', 'id')
        .using_db(connection)
    )
    for index, island in enumerate(islands, start=1):
        if island.sequence_number == index:
            continue
        island.sequence_number = index
        await island.save(using_db=connection, update_fields=['sequence_number', 'updated_at'])


async def getOrCreateSectorByName(sector_name: str, connection: BaseDBAsyncClient) -> Sector:
    normalized_name: str | None = normalizeOptionalText(sector_name)
    if normalized_name is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='O setor informado e invalido.')
    sector: Sector | None = await Sector.filter(name__iexact=normalized_name).using_db(connection).get_or_none()
    if sector:
        return sector
    return await Sector.create(name=normalized_name, using_db=connection)


async def listAssets(*, sector_name: str | None, search: str | None) -> list[Asset]:
    queryset = Asset.all().select_related('sector', 'island').order_by('sector__name', 'island__sequence_number', 'slot_index', 'name')
    if sector_name:
        queryset = queryset.filter(sector__name__iexact=sector_name)
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(desktop_name__icontains=search)
            | Q(user_name__icontains=search)
            | Q(mac_address__icontains=search)
            | Q(patrimony__icontains=search)
            | Q(ip_address__icontains=search)
        )
    return await queryset


async def moveAsset(asset_id: int, payload: AssetMoveSchema) -> Asset:
    async with in_transaction() as connection:
        asset: Asset = await getAssetOrFail(asset_id, connection)
        await asset.fetch_related('sector', 'island')
        source_sector_id: int = asset.sector_id
        source_sector_name: str = asset.sector.name
        source_island_id: int | None = asset.island_id
        source_island_sequence_number: int | None = asset.island.sequence_number if asset.island else None
        source_slot_index: int | None = asset.slot_index
        target_island: Island = await resolveTargetIsland(payload, connection)
        await target_island.fetch_related('sector')
        if payload.target_slot_index > target_island.capacity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Slot de destino fora da capacidade da ilha.')
        occupying_asset: Asset | None = await (
            Asset.filter(island_id=target_island.id, slot_index=payload.target_slot_index)
            .exclude(id=asset.id)
            .using_db(connection)
            .get_or_none()
        )
        asset.sector_id = target_island.sector_id
        asset.island_id = target_island.id
        asset.slot_index = payload.target_slot_index
        if occupying_asset:
            await occupying_asset.fetch_related('sector', 'island')
            occupying_asset.sector_id = source_sector_id
            occupying_asset.island_id = None
            occupying_asset.slot_index = None
            await occupying_asset.save(using_db=connection, update_fields=['sector_id', 'island_id', 'slot_index', 'updated_at'])
        await asset.save(using_db=connection, update_fields=['sector_id', 'island_id', 'slot_index', 'updated_at'])
        if occupying_asset:
            occupying_asset.sector_id = source_sector_id
            occupying_asset.island_id = source_island_id
            occupying_asset.slot_index = source_slot_index
            await occupying_asset.save(using_db=connection, update_fields=['sector_id', 'island_id', 'slot_index', 'updated_at'])
            await recordAssetHistory(
                asset_id=occupying_asset.id,
                event_type='move',
                details={
                    'reason': 'swap',
                    'asset_name': occupying_asset.name,
                    'target_asset_id': asset.id,
                    'target_asset_name': asset.name,
                    'to_sector_id': occupying_asset.sector_id,
                    'to_sector_name': source_sector_name,
                    'island_id': occupying_asset.island_id,
                    'island_sequence_number': source_island_sequence_number,
                    'slot_index': occupying_asset.slot_index,
                },
                connection=connection,
            )
        await cleanupSectorIslands(source_sector_id, connection)
        if source_sector_id != target_island.sector_id:
            await cleanupSectorIslands(target_island.sector_id, connection)
        await recordAssetHistory(
            asset_id=asset.id,
            event_type='move',
            details={
                'asset_name': asset.name,
                'from_sector_id': source_sector_id,
                'from_sector_name': source_sector_name,
                'from_island_id': source_island_id,
                'from_island_sequence_number': source_island_sequence_number,
                'from_slot_index': source_slot_index,
                'to_sector_id': target_island.sector_id,
                'to_sector_name': target_island.sector.name,
                'to_island_id': target_island.id,
                'to_island_sequence_number': target_island.sequence_number,
                'to_slot_index': payload.target_slot_index,
            },
            connection=connection,
        )
    return await getAssetById(asset.id)


async def rebalanceSectorIslands(sector_id: int, connection: BaseDBAsyncClient) -> None:
    assets: list[Asset] = await (
        Asset.filter(sector_id=sector_id)
        .order_by('name', 'id')
        .using_db(connection)
    )
    islands: list[Island] = await (
        Island.filter(sector_id=sector_id)
        .order_by('sequence_number')
        .using_db(connection)
    )
    if len(assets) == 0:
        return
    if len(islands) == 0:
        islands = [
            await Island.create(
                sector_id=sector_id,
                sequence_number=1,
                capacity=ISLAND_CAPACITY,
                using_db=connection,
            )
        ]
    total_capacity: int = sum(island.capacity for island in islands)
    next_sequence_number: int = islands[-1].sequence_number + 1
    while total_capacity < len(assets):
        island: Island = await Island.create(
            sector_id=sector_id,
            sequence_number=next_sequence_number,
            capacity=ISLAND_CAPACITY,
            using_db=connection,
        )
        islands.append(island)
        total_capacity += island.capacity
        next_sequence_number += 1
    asset_index: int = 0
    for island in islands:
        for slot_index in range(1, island.capacity + 1):
            if asset_index >= len(assets):
                return
            asset: Asset = assets[asset_index]
            asset.island_id = island.id
            asset.slot_index = slot_index
            await asset.save(using_db=connection, update_fields=['island_id', 'slot_index', 'updated_at'])
            asset_index += 1


async def resolveTargetIsland(payload: AssetMoveSchema, connection: BaseDBAsyncClient) -> Island:
    if payload.target_island_id is not None:
        island: Island | None = await Island.filter(id=payload.target_island_id).using_db(connection).get_or_none()
        if island is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Ilha de destino nao encontrada.')
        return island
    if payload.target_sector_name is None or payload.target_island_sequence is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Informe a ilha de destino ou setor mais sequencia da ilha.',
        )
    sector: Sector = await getOrCreateSectorByName(payload.target_sector_name, connection)
    return await getOrCreateIsland(
        sector_id=sector.id,
        sequence_number=payload.target_island_sequence,
        connection=connection,
    )


async def updateAsset(asset_id: int, payload: AssetUpdateSchema) -> Asset:
    async with in_transaction() as connection:
        asset: Asset = await getAssetOrFail(asset_id, connection)
        previous_snapshot: dict[str, object] = buildAssetSnapshot(asset)
        previous_sector_id: int = asset.sector_id
        update_values: dict[str, object] = payload.model_dump(exclude_unset=True, exclude={'sector_name'})
        for field_name, field_value in update_values.items():
            normalized_value: object = normalizeOptionalText(field_value) if isinstance(field_value, str) else field_value
            setattr(asset, field_name, normalized_value)
        if payload.sector_name is not None:
            sector: Sector = await getOrCreateSectorByName(payload.sector_name, connection)
            asset.sector_id = sector.id
            asset.island_id = None
            asset.slot_index = None
        await asset.save(using_db=connection)
        if asset.slot_index is None:
            await assignAssetToNextAvailableSlot(asset, connection)
        await asset.fetch_related('sector', 'island')
        if previous_sector_id != asset.sector_id:
            await rebalanceSectorIslands(previous_sector_id, connection)
        await recordAssetHistory(
            asset_id=asset.id,
            event_type='update',
            details={
                'before': previous_snapshot,
                'after': buildAssetSnapshot(asset),
            },
            connection=connection,
        )
    return await getAssetById(asset.id)


def buildAssetValues(values: dict[str, object]) -> dict[str, object]:
    normalized_values: dict[str, object] = {}
    for field_name, field_value in values.items():
        if isinstance(field_value, str):
            normalized_values[field_name] = normalizeOptionalText(field_value)
            continue
        normalized_values[field_name] = field_value
    return normalized_values
