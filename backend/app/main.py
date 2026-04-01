from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from tortoise.contrib.fastapi import RegisterTortoise

from app.api.router import api_router
from app.core.config import AppSettings, getSettings

settings: AppSettings = getSettings()


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    async with RegisterTortoise(
        app=application,
        config=settings.tortoise_config,
        generate_schemas=True,
    ):
        yield


app = FastAPI(
    title=settings.project_name,
    lifespan=lifespan,
)
app.include_router(api_router)


@app.get('/health', tags=['health'])
async def readHealth() -> dict[str, str]:
    return {
        'status': 'ok',
        'environment': settings.environment,
    }
