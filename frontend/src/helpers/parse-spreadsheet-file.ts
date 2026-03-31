import type { WorkBook, WorkSheet } from 'xlsx'
import { columnAliases } from '../constants/column-aliases'
import type { AssetRecord } from '../types/asset-record'
import { assignSectorPositions } from './assign-sector-positions'
import { createSlug } from './create-slug'
import { normalizeText } from './normalize-text'

const DEFAULT_HOSTNAME: string = 'Sem hostname'
const DEFAULT_USER_NAME: string = 'Sem responsavel'
const DEFAULT_SECTOR: string = 'Sem setor'
const DEFAULT_VALUE: string = ''

function getCellText(value: unknown, fallback: string = DEFAULT_VALUE): string {
  if (typeof value === 'string') {
    const sanitizedValue: string = value.trim()
    return sanitizedValue === '' ? fallback : sanitizedValue
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Nao'
  }
  return fallback
}

function getFieldValue(row: Readonly<Record<string, unknown>>, aliases: readonly string[], fallback: string): string {
  const rowEntries: readonly [string, unknown][] = Object.entries(row)
  for (const [key, value] of rowEntries) {
    const normalizedKey: string = normalizeText(key)
    if (aliases.some((alias: string) => normalizeText(alias) === normalizedKey)) {
      return getCellText(value, fallback)
    }
  }
  return fallback
}

function isEmptyRow(row: Readonly<Record<string, unknown>>): boolean {
  return Object.values(row).every((value: unknown) => getCellText(value, '') === '')
}

function buildAssetRecord(row: Readonly<Record<string, unknown>>, sourceSheet: string, rowIndex: number): AssetRecord | null {
  if (isEmptyRow(row)) {
    return null
  }
  const hostname: string = getFieldValue(row, columnAliases.hostname, DEFAULT_HOSTNAME)
  const userName: string = getFieldValue(row, columnAliases.userName, DEFAULT_USER_NAME)
  const sector: string = getFieldValue(row, columnAliases.sector, DEFAULT_SECTOR)
  const macAddress: string = getFieldValue(row, columnAliases.macAddress, DEFAULT_VALUE)
  const location: string = getFieldValue(row, columnAliases.location, DEFAULT_VALUE)
  const model: string = getFieldValue(row, columnAliases.model, DEFAULT_VALUE)
  const notes: string = getFieldValue(row, columnAliases.notes, DEFAULT_VALUE)
  return {
    id: `${createSlug(sourceSheet)}-${rowIndex}-${createSlug(hostname)}-${createSlug(macAddress)}`,
    hostname,
    userName,
    sector,
    positionIndex: 0,
    macAddress,
    location,
    model,
    notes,
    sourceSheet,
  }
}

export async function parseSpreadsheetFile(file: File): Promise<readonly AssetRecord[]> {
  const XLSX = await import('xlsx')
  const fileBuffer: ArrayBuffer = await file.arrayBuffer()
  const workbook: WorkBook = XLSX.read(fileBuffer, { type: 'array' })
  const assets: AssetRecord[] = []
  workbook.SheetNames.forEach((sheetName: string) => {
    const currentSheet: WorkSheet = workbook.Sheets[sheetName]
    const rows: readonly Record<string, unknown>[] = XLSX.utils.sheet_to_json<Record<string, unknown>>(currentSheet, { defval: '' })
    rows.forEach((row: Readonly<Record<string, unknown>>, rowIndex: number) => {
      const assetRecord: AssetRecord | null = buildAssetRecord(row, sheetName, rowIndex + 2)
      if (assetRecord) {
        assets.push(assetRecord)
      }
    })
  })
  if (assets.length === 0) {
    throw new Error('Nenhum ativo valido foi encontrado na planilha. Verifique os cabecalhos e os dados preenchidos.')
  }
  return assignSectorPositions(assets)
}
