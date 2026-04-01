from pydantic import BaseModel


class InventoryImportResponseSchema(BaseModel):
    file_name: str
    total_rows: int
    created_count: int
    updated_count: int
    sector_count: int
    island_count: int
