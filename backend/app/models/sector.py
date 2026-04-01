from tortoise import fields

from app.models.base import BaseModel


class Sector(BaseModel):
    """Represents a business sector that owns islands and assets."""

    name = fields.CharField(max_length=120, unique=True)
    islands: fields.ReverseRelation['Island']
    assets: fields.ReverseRelation['Asset']

    class Meta:
        table = 'sectors'
        ordering = ['name']
