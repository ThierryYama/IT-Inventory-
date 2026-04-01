from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.services.export_service import exportAssetsToCsv

router = APIRouter(prefix='/api', tags=['export'])


@router.get('/export')
async def exportAssetsRoute() -> StreamingResponse:
    csv_content: str = await exportAssetsToCsv()
    return StreamingResponse(
        iter([csv_content]),
        media_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename=inventory-export.csv'},
    )
