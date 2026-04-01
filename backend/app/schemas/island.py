from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.asset import AssetResponseSchema


class IslandResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sector_id: int
    sequence_number: int
    capacity: int
    asset_count: int
    assets: list[AssetResponseSchema]
    created_at: datetime
    updated_at: datetime
