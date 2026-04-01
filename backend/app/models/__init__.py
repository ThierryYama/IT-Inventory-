"""Database models package."""

from app.models.asset import Asset
from app.models.history import AssetHistory
from app.models.island import ISLAND_CAPACITY, Island
from app.models.sector import Sector

__models__ = [Sector, Island, Asset, AssetHistory]
