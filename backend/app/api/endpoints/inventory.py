from fastapi import APIRouter, File, UploadFile, status

from app.schemas.inventory import InventoryImportResponseSchema
from app.services.inventory_service import bulkImportInventory

router = APIRouter(prefix='/api/inventory', tags=['inventory'])


@router.post('/bulk-import', response_model=InventoryImportResponseSchema, status_code=status.HTTP_201_CREATED)
async def bulkImportInventoryRoute(file: UploadFile = File(...)) -> InventoryImportResponseSchema:
    file_bytes: bytes = await file.read()
    return await bulkImportInventory(file_name=file.filename or 'inventory-upload', file_bytes=file_bytes)
