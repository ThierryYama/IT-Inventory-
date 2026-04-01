import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef, useState, type ReactElement } from 'react'
import { EllipsisVertical, GripVertical, History, Monitor, Network, Pencil, Trash2, UserRound } from 'lucide-react'
import type { AssetRecord } from '../types/asset-record'

interface AssetNodeProps {
  readonly asset?: AssetRecord
  readonly slotId?: string
  readonly isDragOverlay?: boolean
  readonly onDelete?: (asset: AssetRecord) => void
  readonly onEdit?: (asset: AssetRecord) => void
  readonly onViewHistory?: (asset: AssetRecord) => void
}

export function AssetNode({
  asset,
  slotId = '',
  isDragOverlay = false,
  onDelete,
  onEdit,
  onViewHistory,
}: AssetNodeProps): ReactElement {
  if (!asset) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-4 text-center text-sm text-slate-500">
        Posicao livre
      </div>
    )
  }
  return (
    <DraggableAssetNode
      asset={asset}
      slotId={slotId}
      isDragOverlay={isDragOverlay}
      onDelete={onDelete}
      onEdit={onEdit}
      onViewHistory={onViewHistory}
    />
  )
}

interface DraggableAssetNodeProps {
  readonly asset: AssetRecord
  readonly slotId: string
  readonly isDragOverlay: boolean
  readonly onDelete?: (asset: AssetRecord) => void
  readonly onEdit?: (asset: AssetRecord) => void
  readonly onViewHistory?: (asset: AssetRecord) => void
}

function DraggableAssetNode({
  asset,
  slotId,
  isDragOverlay,
  onDelete,
  onEdit,
  onViewHistory,
}: DraggableAssetNodeProps): ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const menuReference = useRef<HTMLDivElement | null>(null)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: isDragOverlay ? `asset-${asset.id}-overlay` : `asset-${asset.id}`,
    data: {
      assetId: asset.id,
      slotId,
    },
    disabled: isDragOverlay || slotId === '',
  })
  const draggableStyle = {
    opacity: isDragging ? 0.4 : 1,
    transform: CSS.Translate.toString(transform),
  }
  const hasModel: boolean = asset.modelName !== null
  const hasMacAddress: boolean = asset.macAddress !== null
  const hasDesktopName: boolean = asset.desktopName !== null
  const canInteract: boolean = !isDragOverlay
  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      if (!menuReference.current?.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (!isMenuOpen) {
      return
    }
    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [isMenuOpen])
  return (
    <article
      ref={setNodeRef}
      style={draggableStyle}
      className="flex min-h-48 flex-col justify-between rounded-3xl border border-cyan-400/20 bg-slate-950/80 p-4 shadow-lg shadow-cyan-950/20 transition"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            <UserRound className="size-3.5 text-cyan-300" />
            <span className="truncate">{asset.userName ?? 'Sem usuario'}</span>
          </div>
          <div className="flex items-center gap-2">
            {slotId !== '' && canInteract ? (
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 active:cursor-grabbing"
                aria-label="Mover maquina"
              >
                <GripVertical className="size-4" />
              </button>
            ) : null}
            {canInteract ? (
              <div ref={menuReference} className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((currentValue: boolean) => !currentValue)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
                  aria-label="Abrir acoes da maquina"
                >
                  <EllipsisVertical className="size-4" />
                </button>
                {isMenuOpen ? (
                  <div className="absolute right-0 top-11 z-20 w-44 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-slate-950/50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onEdit?.(asset)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-200 transition hover:bg-white/10"
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onViewHistory?.(asset)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-200 transition hover:bg-white/10"
                    >
                      <History className="size-3.5" />
                      Historico
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false)
                        onDelete?.(asset)
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-100 transition hover:bg-rose-400/15"
                    >
                      <Trash2 className="size-3.5" />
                      Excluir
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <Monitor className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{asset.name}</p>
            {hasModel ? <p className="truncate text-xs text-slate-400">{asset.modelName}</p> : null}
          </div>
        </div>
      </div>
      <div className="space-y-3 text-left text-xs text-slate-400">
        {hasMacAddress ? (
          <div className="flex items-center gap-2">
            <Network className="size-3.5 text-violet-300" />
            <span className="truncate">{asset.macAddress}</span>
          </div>
        ) : null}
        {hasDesktopName ? <p className="truncate">Desktop: {asset.desktopName}</p> : null}
        <p className="truncate text-slate-500">
          {asset.sectorName}
          {asset.islandSequenceNumber !== null && asset.slotIndex !== null
            ? ` • Ilha ${asset.islandSequenceNumber} • Slot ${asset.slotIndex}`
            : ''}
        </p>
      </div>
    </article>
  )
}
