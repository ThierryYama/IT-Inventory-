from tortoise import fields

from app.models.base import BaseModel


class Asset(BaseModel):
    """Represents a machine imported from the inventory spreadsheet."""

    name = fields.CharField(max_length=255)
    ip_address = fields.CharField(max_length=64, null=True)
    mac_address = fields.CharField(max_length=64, null=True)
    wifi_mac_address = fields.CharField(max_length=64, null=True)
    model_name = fields.CharField(max_length=255, null=True)
    user_name = fields.CharField(max_length=255, null=True)
    processor = fields.CharField(max_length=255, null=True)
    memory = fields.CharField(max_length=255, null=True)
    storage = fields.CharField(max_length=255, null=True)
    brand = fields.CharField(max_length=255, null=True)
    part_number = fields.CharField(max_length=255, null=True)
    patrimony = fields.CharField(max_length=255, null=True)
    desktop_name = fields.CharField(max_length=255, null=True)
    asset_type = fields.CharField(max_length=255, null=True)
    operating_system = fields.CharField(max_length=255, null=True)
    sector = fields.ForeignKeyField('models.Sector', related_name='assets', on_delete=fields.RESTRICT)
    island = fields.ForeignKeyField('models.Island', related_name='assets', null=True, on_delete=fields.SET_NULL)
    slot_index = fields.IntField(null=True)
    history_entries: fields.ReverseRelation['AssetHistory']

    class Meta:
        table = 'assets'
        ordering = ['name', 'id']
        unique_together = (('island', 'slot_index'),)
        indexes = (
            ('name',),
            ('desktop_name',),
            ('patrimony',),
            ('mac_address',),
        )
