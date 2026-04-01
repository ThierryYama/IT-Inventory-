from csv import DictWriter
from io import StringIO

from app.models.asset import Asset

EXPORT_HEADERS: tuple[str, ...] = (
    'Nome',
    'IP',
    'MAC',
    'MAC WI-FI',
    'Modelo',
    'User',
    'Setor',
    'Processador',
    'Memoria',
    'Disco',
    'Marca',
    'Partnumber',
    'Patrimonio',
    'Desktop',
    'Tipo',
    'SO',
    'Ilha',
    'Slot',
)


async def exportAssetsToCsv() -> str:
    assets: list[Asset] = await (
        Asset.all()
        .select_related('sector', 'island')
        .order_by('sector__name', 'island__sequence_number', 'slot_index', 'name')
    )
    output: StringIO = StringIO()
    writer: DictWriter[str] = DictWriter(output, fieldnames=list(EXPORT_HEADERS))
    writer.writeheader()
    for asset in assets:
        writer.writerow(
            {
                'Nome': asset.name,
                'IP': asset.ip_address or '',
                'MAC': asset.mac_address or '',
                'MAC WI-FI': asset.wifi_mac_address or '',
                'Modelo': asset.model_name or '',
                'User': asset.user_name or '',
                'Setor': asset.sector.name,
                'Processador': asset.processor or '',
                'Memoria': asset.memory or '',
                'Disco': asset.storage or '',
                'Marca': asset.brand or '',
                'Partnumber': asset.part_number or '',
                'Patrimonio': asset.patrimony or '',
                'Desktop': asset.desktop_name or '',
                'Tipo': asset.asset_type or '',
                'SO': asset.operating_system or '',
                'Ilha': asset.island.sequence_number if asset.island else '',
                'Slot': asset.slot_index or '',
            }
        )
    return output.getvalue()
