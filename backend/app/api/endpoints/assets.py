from fastapi import APIRouter, Response, status

from app.schemas.asset import AssetCreateSchema, AssetMoveSchema, AssetResponseSchema, AssetUpdateSchema
from app.schemas.history import AssetHistoryResponseSchema
from app.services.asset_service import createAsset, deleteAsset, getAssetById, getAssetHistory, listAssets, moveAsset, updateAsset
from app.services.serializers import buildAssetHistoryResponse, buildAssetResponse

router = APIRouter(prefix='/api/assets', tags=['assets'])


@router.get('', response_model=list[AssetResponseSchema])
async def listAssetsRoute(sector: str | None = None, search: str | None = None) -> list[AssetResponseSchema]:
    assets = await listAssets(sector_name=sector, search=search)
    return [buildAssetResponse(asset) for asset in assets]


@router.post('', response_model=AssetResponseSchema, status_code=status.HTTP_201_CREATED)
async def createAssetRoute(payload: AssetCreateSchema) -> AssetResponseSchema:
    asset = await createAsset(payload)
    return buildAssetResponse(asset)


@router.get('/{asset_id}', response_model=AssetResponseSchema)
async def getAssetRoute(asset_id: int) -> AssetResponseSchema:
    asset = await getAssetById(asset_id)
    return buildAssetResponse(asset)


@router.put('/{asset_id}', response_model=AssetResponseSchema)
async def replaceAssetRoute(asset_id: int, payload: AssetUpdateSchema) -> AssetResponseSchema:
    asset = await updateAsset(asset_id, payload)
    return buildAssetResponse(asset)


@router.patch('/{asset_id}', response_model=AssetResponseSchema)
async def updateAssetRoute(asset_id: int, payload: AssetUpdateSchema) -> AssetResponseSchema:
    asset = await updateAsset(asset_id, payload)
    return buildAssetResponse(asset)


@router.patch('/{asset_id}/move', response_model=AssetResponseSchema)
async def moveAssetRoute(asset_id: int, payload: AssetMoveSchema) -> AssetResponseSchema:
    asset = await moveAsset(asset_id, payload)
    return buildAssetResponse(asset)


@router.get('/{asset_id}/history', response_model=list[AssetHistoryResponseSchema])
async def getAssetHistoryRoute(asset_id: int) -> list[AssetHistoryResponseSchema]:
    history_entries = await getAssetHistory(asset_id)
    return [buildAssetHistoryResponse(history_entry) for history_entry in history_entries]


@router.delete('/{asset_id}', status_code=status.HTTP_204_NO_CONTENT)
async def deleteAssetRoute(asset_id: int) -> Response:
    await deleteAsset(asset_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
