from tortoise import fields

from app.models.base import BaseModel


class AssetHistory(BaseModel):
    """Stores relevant asset lifecycle events such as import and movement."""

    asset = fields.ForeignKeyField('models.Asset', related_name='history_entries', on_delete=fields.CASCADE)
    event_type = fields.CharField(max_length=40)
    details = fields.JSONField(default=dict)

    class Meta:
        table = 'asset_history'
        ordering = ['-created_at', '-id']
