from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.island import IslandResponseSchema


class SectorResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    island_count: int
    asset_count: int
    created_at: datetime
    updated_at: datetime


class SectorIslandsResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    islands: list[IslandResponseSchema]
    created_at: datetime
    updated_at: datetime
