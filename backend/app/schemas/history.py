from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AssetHistoryResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    asset_id: int
    event_type: str
    details: dict[str, object]
    created_at: datetime
    updated_at: datetime
