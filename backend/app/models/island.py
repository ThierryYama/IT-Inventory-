from tortoise import fields

from app.models.base import BaseModel

ISLAND_CAPACITY: int = 4


class Island(BaseModel):
    """Represents a visual island grouping assets inside a sector."""

    sector = fields.ForeignKeyField('models.Sector', related_name='islands', on_delete=fields.CASCADE)
    sequence_number = fields.IntField()
    capacity = fields.IntField(default=ISLAND_CAPACITY)
    assets: fields.ReverseRelation['Asset']

    class Meta:
        table = 'islands'
        ordering = ['sector_id', 'sequence_number']
        unique_together = (('sector', 'sequence_number'),)
