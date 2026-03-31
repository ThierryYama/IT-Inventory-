from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from tortoise import Tortoise

from app.core.config import AppSettings, getSettings

settings: AppSettings = getSettings()


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    await Tortoise.init(config=settings.tortoise_config)
    yield
    await Tortoise.close_connections()


app = FastAPI(
    title=settings.project_name,
    lifespan=lifespan,
)


@app.get('/health', tags=['health'])
async def readHealth() -> dict[str, str]:
    return {
        'status': 'ok',
        'environment': settings.environment,
    }
