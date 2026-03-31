import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { ReactElement } from 'react'
import { Monitor, Network, UserRound } from 'lucide-react'
import type { AssetRecord } from '../types/asset-record'

interface AssetNodeProps {
  readonly asset?: AssetRecord
  readonly slotId?: string
  readonly isDragOverlay?: boolean
}

export function AssetNode({ asset, slotId = '', isDragOverlay = false }: AssetNodeProps): ReactElement {
  if (!asset) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-950/40 p-4 text-center text-sm text-slate-500">
        Posicao livre
      </div>
    )
  }
  return <DraggableAssetNode asset={asset} slotId={slotId} isDragOverlay={isDragOverlay} />
}

interface DraggableAssetNodeProps {
  readonly asset: AssetRecord
  readonly slotId: string
  readonly isDragOverlay: boolean
}

function DraggableAssetNode({ asset, slotId, isDragOverlay }: DraggableAssetNodeProps): ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: isDragOverlay ? `${asset.id}-overlay` : asset.id,
    data: {
      assetId: asset.id,
      sectorId: asset.sector,
      positionIndex: asset.positionIndex,
      slotId,
    },
    disabled: isDragOverlay,
  })
  const draggableStyle = {
    opacity: isDragging ? 0.4 : 1,
    transform: CSS.Translate.toString(transform),
  }
  const hasModel: boolean = asset.model !== ''
  const hasMacAddress: boolean = asset.macAddress !== ''
  const hasLocation: boolean = asset.location !== ''
  return (
    <article
      ref={setNodeRef}
      style={draggableStyle}
      {...(isDragOverlay ? {} : attributes)}
      {...(isDragOverlay ? {} : listeners)}
      className={`flex min-h-40 flex-col justify-between rounded-3xl border border-cyan-400/20 bg-slate-950/80 p-4 shadow-lg shadow-cyan-950/20 transition ${
        isDragOverlay ? '' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
          <UserRound className="size-3.5 text-cyan-300" />
          <span className="truncate">{asset.userName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <Monitor className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{asset.hostname}</p>
            {hasModel ? <p className="truncate text-xs text-slate-400">{asset.model}</p> : null}
          </div>
        </div>
      </div>
      <div className="space-y-2 text-left text-xs text-slate-400">
        {hasMacAddress ? (
          <div className="flex items-center gap-2">
            <Network className="size-3.5 text-violet-300" />
            <span className="truncate">{asset.macAddress}</span>
          </div>
        ) : null}
        {hasLocation ? <p className="truncate">{asset.location}</p> : null}
      </div>
    </article>
  )
}
