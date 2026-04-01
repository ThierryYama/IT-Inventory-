from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AssetBaseSchema(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    ip_address: str | None = None
    mac_address: str | None = None
    wifi_mac_address: str | None = None
    model_name: str | None = None
    user_name: str | None = None
    processor: str | None = None
    memory: str | None = None
    storage: str | None = None
    brand: str | None = None
    part_number: str | None = None
    patrimony: str | None = None
    desktop_name: str | None = None
    asset_type: str | None = None
    operating_system: str | None = None


class AssetCreateSchema(AssetBaseSchema):
    sector_name: str = Field(min_length=1, max_length=120)


class AssetUpdateSchema(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    ip_address: str | None = None
    mac_address: str | None = None
    wifi_mac_address: str | None = None
    model_name: str | None = None
    user_name: str | None = None
    processor: str | None = None
    memory: str | None = None
    storage: str | None = None
    brand: str | None = None
    part_number: str | None = None
    patrimony: str | None = None
    desktop_name: str | None = None
    asset_type: str | None = None
    operating_system: str | None = None
    sector_name: str | None = Field(default=None, min_length=1, max_length=120)


class AssetMoveSchema(BaseModel):
    target_slot_index: int = Field(ge=1, le=4)
    target_island_id: int | None = Field(default=None, ge=1)
    target_sector_name: str | None = Field(default=None, min_length=1, max_length=120)
    target_island_sequence: int | None = Field(default=None, ge=1)


class AssetResponseSchema(AssetBaseSchema):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sector_id: int
    sector_name: str
    island_id: int | None
    island_sequence_number: int | None
    slot_index: int | None
    created_at: datetime
    updated_at: datetime
