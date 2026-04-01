import type { ReactElement } from 'react'
import { Clock3 } from 'lucide-react'
import type { AssetHistoryRecord } from '../types/asset-history-record'
import type { AssetRecord } from '../types/asset-record'
import { ModalShell } from './modal-shell'

interface AssetHistoryModalProps {
  readonly asset: AssetRecord
  readonly historyEntries: readonly AssetHistoryRecord[]
  readonly isLoading: boolean
  readonly onClose: () => void
}

interface FormattedHistoryEntry {
  readonly description: string
  readonly details: string
}

const fieldLabels = {
  asset_type: 'tipo',
  brand: 'marca',
  desktop_name: 'desktop',
  id: 'identificador',
  ip_address: 'IP',
  island_id: 'ilha',
  island_sequence_number: 'sequencia da ilha',
  mac_address: 'MAC',
  memory: 'memoria',
  model_name: 'modelo',
  name: 'nome',
  operating_system: 'sistema operacional',
  part_number: 'partnumber',
  patrimony: 'patrimonio',
  processor: 'processador',
  sector_id: 'setor',
  sector_name: 'setor',
  slot_index: 'slot',
  storage: 'disco',
  user_name: 'usuario',
  wifi_mac_address: 'MAC WI-FI',
} as const

function getNumberValue(value: unknown): number | null {
  return typeof value === 'number' ? value : null
}

function getStringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function getDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return 'vazio'
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value)
}

function formatMoveDescription(asset: AssetRecord, details: Record<string, unknown>): string {
  const assetName: string = getStringValue(details.asset_name) ?? asset.name
  const fromSectorName: string = getStringValue(details.from_sector_name) ?? 'setor atual'
  const toSectorName: string = getStringValue(details.to_sector_name) ?? asset.sectorName
  const fromIslandSequenceNumber: number | null = getNumberValue(details.from_island_sequence_number)
  const toIslandSequenceNumber: number | null = getNumberValue(details.to_island_sequence_number)
  const fromSlotIndex: number | null = getNumberValue(details.from_slot_index)
  const toSlotIndex: number | null = getNumberValue(details.to_slot_index)
  const fromLocation: string =
    fromIslandSequenceNumber !== null && fromSlotIndex !== null
      ? `ilha ${fromIslandSequenceNumber}, slot ${fromSlotIndex}`
      : 'posicao anterior'
  const toLocation: string =
    toIslandSequenceNumber !== null && toSlotIndex !== null
      ? `ilha ${toIslandSequenceNumber}, slot ${toSlotIndex}`
      : 'nova posicao'
  return `Maquina ${assetName} saiu do setor ${fromSectorName} (${fromLocation}) e foi para o setor ${toSectorName} (${toLocation}).`
}

function formatSwapDescription(asset: AssetRecord, details: Record<string, unknown>): string {
  const assetName: string = getStringValue(details.asset_name) ?? asset.name
  const targetAssetName: string = getStringValue(details.target_asset_name) ?? 'outra maquina'
  const islandSequenceNumber: number | null = getNumberValue(details.island_sequence_number)
  const slotIndex: number | null = getNumberValue(details.slot_index)
  if (islandSequenceNumber !== null && slotIndex !== null) {
    return `Maquina ${assetName} trocou de lugar com ${targetAssetName} e ficou na ilha ${islandSequenceNumber}, slot ${slotIndex}.`
  }
  return `Maquina ${assetName} trocou de lugar com ${targetAssetName}.`
}

function formatUpdateDescription(asset: AssetRecord, details: Record<string, unknown>): string {
  const beforeState: Record<string, unknown> = typeof details.before === 'object' && details.before !== null
    ? (details.before as Record<string, unknown>)
    : {}
  const afterState: Record<string, unknown> = typeof details.after === 'object' && details.after !== null
    ? (details.after as Record<string, unknown>)
    : {}
  const changedFields: string[] = Object.keys(afterState).flatMap((fieldName: string) => {
    if (beforeState[fieldName] === afterState[fieldName]) {
      return []
    }
    const fieldLabel: string = fieldLabels[fieldName as keyof typeof fieldLabels] ?? fieldName
    return [
      `Campo ${fieldLabel} foi editado na maquina ${asset.name}: de ${getDisplayValue(beforeState[fieldName])} para ${getDisplayValue(afterState[fieldName])}.`,
    ]
  })
  if (changedFields.length === 0) {
    return `Os dados da maquina ${asset.name} foram atualizados, mas nao foi possivel identificar quais campos mudaram.`
  }
  return changedFields.join('\n')
}

function formatHistoryEntry(asset: AssetRecord, historyEntry: AssetHistoryRecord): FormattedHistoryEntry {
  if (historyEntry.eventType === 'move') {
    const reason: string | null = getStringValue(historyEntry.details.reason)
    if (reason === 'swap') {
      return {
        description: 'Movimentacao com troca',
        details: formatSwapDescription(asset, historyEntry.details),
      }
    }
    return {
      description: 'Movimentacao de ilha',
      details: formatMoveDescription(asset, historyEntry.details),
    }
  }
  if (historyEntry.eventType === 'create') {
    return {
      description: 'Cadastro de maquina',
      details: `A maquina ${asset.name} foi cadastrada e posicionada no inventario.`,
    }
  }
  if (historyEntry.eventType === 'import') {
    const mode: string | null = getStringValue(historyEntry.details.mode)
    const fileName: string | null = getStringValue(historyEntry.details.file_name)
    return {
      description: 'Importacao de planilha',
      details: `A maquina ${asset.name} foi ${mode === 'update' ? 'atualizada' : 'importada'} a partir do arquivo ${fileName ?? 'informado'}.`,
    }
  }
  if (historyEntry.eventType === 'update') {
    return {
      description: 'Atualizacao manual',
      details: formatUpdateDescription(asset, historyEntry.details),
    }
  }
  const formattedDetails: string = JSON.stringify(historyEntry.details, null, 2)
  return {
    description: historyEntry.eventType,
    details: formattedDetails === '{}' ? 'Sem detalhes adicionais.' : formattedDetails,
  }
}

export function AssetHistoryModal({
  asset,
  historyEntries,
  isLoading,
  onClose,
}: AssetHistoryModalProps): ReactElement {
  return (
    <ModalShell
      title={`Historico de ${asset.name}`}
      description="Eventos de importacao, atualizacao e movimentacao registrados pelo backend."
      onClose={onClose}
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
            Carregando historico...
          </div>
        ) : null}
        {!isLoading && historyEntries.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-slate-300">
            Nenhum evento registrado para esta maquina.
          </div>
        ) : null}
        {!isLoading
          ? historyEntries.map((historyEntry: AssetHistoryRecord) => (
              <article key={historyEntry.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-200">
                  <Clock3 className="size-4" />
                  <span>{formatHistoryEntry(asset, historyEntry).description}</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">{historyEntry.createdAt}</p>
                <div className="mt-4 rounded-2xl bg-slate-950/70 p-4 text-sm leading-6 text-slate-300 whitespace-pre-wrap">
                  {formatHistoryEntry(asset, historyEntry).details}
                </div>
              </article>
            ))
          : null}
      </div>
    </ModalShell>
  )
}
