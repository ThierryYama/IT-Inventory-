from collections.abc import Iterable
from csv import DictReader
from dataclasses import dataclass
from io import BytesIO, StringIO

import openpyxl
import xlrd

from app.utils.text import normalizeOptionalText, normalizeText

FIELD_ALIASES: dict[str, tuple[str, ...]] = {
    'name': ('nome', 'hostname', 'host name', 'nome do host'),
    'ip_address': ('ip',),
    'mac_address': ('mac',),
    'wifi_mac_address': ('macwifi', 'macwi-fi', 'mac wi fi', 'mac wi-fi'),
    'model_name': ('modelo',),
    'user_name': ('user', 'usuario', 'responsavel', 'responsável'),
    'sector_name': ('setor',),
    'processor': ('processador',),
    'memory': ('memoria',),
    'storage': ('disco',),
    'brand': ('marca',),
    'part_number': ('partnumber', 'part number'),
    'patrimony': ('patrimonio', 'asset tag'),
    'desktop_name': ('desktop',),
    'asset_type': ('tipo',),
    'operating_system': ('so', 'sistemaoperacional'),
}


@dataclass(frozen=True)
class SpreadsheetAssetRow:
    name: str
    sector_name: str
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


def decodeCsvContent(file_bytes: bytes) -> str:
    for encoding in ('utf-8-sig', 'utf-8', 'latin-1'):
        try:
            return file_bytes.decode(encoding)
        except UnicodeDecodeError:
            continue
    raise ValueError('Nao foi possivel decodificar o arquivo CSV informado.')


def mapSpreadsheetRow(row: dict[str, object]) -> SpreadsheetAssetRow | None:
    normalized_row: dict[str, str | None] = {
        field_name: getMappedValue(row=row, aliases=aliases)
        for field_name, aliases in FIELD_ALIASES.items()
    }
    if normalized_row['name'] is None or normalized_row['sector_name'] is None:
        return None
    return SpreadsheetAssetRow(
        name=normalized_row['name'],
        sector_name=normalized_row['sector_name'],
        ip_address=normalized_row['ip_address'],
        mac_address=normalized_row['mac_address'],
        wifi_mac_address=normalized_row['wifi_mac_address'],
        model_name=normalized_row['model_name'],
        user_name=normalized_row['user_name'],
        processor=normalized_row['processor'],
        memory=normalized_row['memory'],
        storage=normalized_row['storage'],
        brand=normalized_row['brand'],
        part_number=normalized_row['part_number'],
        patrimony=normalized_row['patrimony'],
        desktop_name=normalized_row['desktop_name'],
        asset_type=normalized_row['asset_type'],
        operating_system=normalized_row['operating_system'],
    )


def getMappedValue(row: dict[str, object], aliases: Iterable[str]) -> str | None:
    normalized_aliases: set[str] = {normalizeText(alias) for alias in aliases}
    for key, value in row.items():
        if normalizeText(str(key)) not in normalized_aliases:
            continue
        return normalizeOptionalText(str(value))
    return None


def parseCsvRows(file_bytes: bytes) -> list[SpreadsheetAssetRow]:
    csv_content: str = decodeCsvContent(file_bytes)
    reader: DictReader[str] = DictReader(StringIO(csv_content))
    return buildRowsFromMappings(reader)


def parseXlsRows(file_bytes: bytes) -> list[SpreadsheetAssetRow]:
    workbook = xlrd.open_workbook(file_contents=file_bytes)
    parsed_rows: list[SpreadsheetAssetRow] = []
    for sheet in workbook.sheets():
        header_values: list[object] = sheet.row_values(0) if sheet.nrows > 0 else []
        for row_index in range(1, sheet.nrows):
            row_values: list[object] = sheet.row_values(row_index)
            row_mapping: dict[str, object] = {
                str(header_values[column_index]): row_values[column_index]
                for column_index in range(min(len(header_values), len(row_values)))
            }
            mapped_row: SpreadsheetAssetRow | None = mapSpreadsheetRow(row_mapping)
            if mapped_row:
                parsed_rows.append(mapped_row)
    return parsed_rows


def parseXlsxRows(file_bytes: bytes) -> list[SpreadsheetAssetRow]:
    workbook = openpyxl.load_workbook(filename=BytesIO(file_bytes), read_only=True, data_only=True)
    parsed_rows: list[SpreadsheetAssetRow] = []
    for worksheet in workbook.worksheets:
        rows = list(worksheet.iter_rows(values_only=True))
        if len(rows) == 0:
            continue
        header_values: tuple[object, ...] = rows[0]
        for row_values in rows[1:]:
            row_mapping: dict[str, object] = {
                str(header_values[column_index]): row_values[column_index]
                for column_index in range(min(len(header_values), len(row_values)))
            }
            mapped_row: SpreadsheetAssetRow | None = mapSpreadsheetRow(row_mapping)
            if mapped_row:
                parsed_rows.append(mapped_row)
    return parsed_rows


def buildRowsFromMappings(row_mappings: Iterable[dict[str, object]]) -> list[SpreadsheetAssetRow]:
    parsed_rows: list[SpreadsheetAssetRow] = []
    for row_mapping in row_mappings:
        mapped_row: SpreadsheetAssetRow | None = mapSpreadsheetRow(row_mapping)
        if mapped_row:
            parsed_rows.append(mapped_row)
    return parsed_rows


def parseSpreadsheetRows(file_name: str, file_bytes: bytes) -> list[SpreadsheetAssetRow]:
    normalized_name: str = file_name.lower()
    if normalized_name.endswith('.csv'):
        rows: list[SpreadsheetAssetRow] = parseCsvRows(file_bytes)
    elif normalized_name.endswith('.xlsx'):
        rows = parseXlsxRows(file_bytes)
    elif normalized_name.endswith('.xls'):
        rows = parseXlsRows(file_bytes)
    else:
        raise ValueError('Formato de arquivo nao suportado. Use CSV, XLSX ou XLS.')
    if len(rows) == 0:
        raise ValueError('Nenhuma linha valida foi encontrada na planilha informada.')
    return rows
