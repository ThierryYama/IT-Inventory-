from fastapi import APIRouter

from app.api.endpoints.assets import router as assets_router
from app.api.endpoints.export import router as export_router
from app.api.endpoints.inventory import router as inventory_router
from app.api.endpoints.sectors import router as sectors_router

api_router = APIRouter()
api_router.include_router(inventory_router)
api_router.include_router(assets_router)
api_router.include_router(sectors_router)
api_router.include_router(export_router)
