from fastapi import APIRouter, HTTPException, status

from app.models.asset import Asset
from app.models.island import Island
from app.models.sector import Sector
from app.schemas.island import IslandCreateSchema, IslandResponseSchema
from app.schemas.sector import SectorIslandsResponseSchema, SectorResponseSchema
from app.services.asset_service import createManualIsland, deleteEmptyIsland
from app.services.serializers import buildIslandResponse, buildSectorIslandsResponse, buildSectorResponse

router = APIRouter(prefix='/api/sectors', tags=['sectors'])


@router.get('', response_model=list[SectorResponseSchema])
async def listSectorsRoute() -> list[SectorResponseSchema]:
    sectors: list[Sector] = await Sector.all().order_by('name')
    responses: list[SectorResponseSchema] = []
    for sector in sectors:
        island_count: int = await Island.filter(sector_id=sector.id).count()
        asset_count: int = await Asset.filter(sector_id=sector.id).count()
        responses.append(buildSectorResponse(sector, island_count=island_count, asset_count=asset_count))
    return responses


@router.get('/{sector_name}/islands', response_model=SectorIslandsResponseSchema)
async def listSectorIslandsRoute(sector_name: str) -> SectorIslandsResponseSchema:
    sector: Sector | None = await Sector.filter(name__iexact=sector_name).get_or_none()
    if sector is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Setor nao encontrado.')
    islands: list[Island] = await Island.filter(sector_id=sector.id).order_by('sequence_number')
    island_responses = []
    for island in islands:
        assets: list[Asset] = await (
            Asset.filter(island_id=island.id)
            .select_related('sector', 'island')
            .order_by('slot_index', 'name')
        )
        island_responses.append(buildIslandResponse(island, assets))
    return buildSectorIslandsResponse(sector, island_responses)


@router.post('/{sector_name}/islands', response_model=IslandResponseSchema, status_code=status.HTTP_201_CREATED)
async def createSectorIslandRoute(sector_name: str, payload: IslandCreateSchema) -> IslandResponseSchema:
    island: Island = await createManualIsland(sector_name, payload)
    return buildIslandResponse(island, [])


@router.delete('/islands/{island_id}', status_code=status.HTTP_204_NO_CONTENT)
async def deleteSectorIslandRoute(island_id: int) -> None:
    await deleteEmptyIsland(island_id)
