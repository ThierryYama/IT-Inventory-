from app.models.asset import Asset
from app.models.history import AssetHistory
from app.models.island import Island
from app.models.sector import Sector
from app.schemas.asset import AssetResponseSchema
from app.schemas.history import AssetHistoryResponseSchema
from app.schemas.island import IslandResponseSchema
from app.schemas.sector import SectorIslandsResponseSchema, SectorResponseSchema


def buildAssetResponse(asset: Asset) -> AssetResponseSchema:
    return AssetResponseSchema.model_validate(
        {
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
            'sector_name': asset.sector.name,
            'island_id': asset.island_id,
            'island_sequence_number': asset.island.sequence_number if asset.island else None,
            'slot_index': asset.slot_index,
            'created_at': asset.created_at,
            'updated_at': asset.updated_at,
        }
    )


def buildAssetHistoryResponse(history_entry: AssetHistory) -> AssetHistoryResponseSchema:
    return AssetHistoryResponseSchema.model_validate(
        {
            'id': history_entry.id,
            'asset_id': history_entry.asset_id,
            'event_type': history_entry.event_type,
            'details': history_entry.details,
            'created_at': history_entry.created_at,
            'updated_at': history_entry.updated_at,
        }
    )


def buildIslandResponse(island: Island, assets: list[Asset]) -> IslandResponseSchema:
    return IslandResponseSchema.model_validate(
        {
            'id': island.id,
            'sector_id': island.sector_id,
            'sequence_number': island.sequence_number,
            'capacity': island.capacity,
            'asset_count': len(assets),
            'assets': [buildAssetResponse(asset) for asset in assets],
            'created_at': island.created_at,
            'updated_at': island.updated_at,
        }
    )


def buildSectorResponse(sector: Sector, island_count: int, asset_count: int) -> SectorResponseSchema:
    return SectorResponseSchema.model_validate(
        {
            'id': sector.id,
            'name': sector.name,
            'island_count': island_count,
            'asset_count': asset_count,
            'created_at': sector.created_at,
            'updated_at': sector.updated_at,
        }
    )


def buildSectorIslandsResponse(sector: Sector, islands: list[IslandResponseSchema]) -> SectorIslandsResponseSchema:
    return SectorIslandsResponseSchema.model_validate(
        {
            'id': sector.id,
            'name': sector.name,
            'islands': islands,
            'created_at': sector.created_at,
            'updated_at': sector.updated_at,
        }
    )
