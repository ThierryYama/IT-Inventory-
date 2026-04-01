from tortoise.backends.base.client import BaseDBAsyncClient

from app.models.history import AssetHistory


async def recordAssetHistory(
    *,
    asset_id: int,
    event_type: str,
    details: dict[str, object],
    connection: BaseDBAsyncClient,
) -> AssetHistory:
    return await AssetHistory.create(
        asset_id=asset_id,
        event_type=event_type,
        details=details,
        using_db=connection,
    )
