import { useDroppable } from '@dnd-kit/core'
import type { ReactElement } from 'react'
import type { AssetRecord } from '../types/asset-record'
import { AssetNode } from './asset-node'

interface IslandSlotProps {
  readonly asset?: AssetRecord
  readonly slotId: string
  readonly className?: string
  readonly onDeleteAsset: (asset: AssetRecord) => void
  readonly onEditAsset: (asset: AssetRecord) => void
  readonly onViewHistory: (asset: AssetRecord) => void
}

export function IslandSlot({ asset, slotId, className = '', onDeleteAsset, onEditAsset, onViewHistory }: IslandSlotProps): ReactElement {
  const { isOver, setNodeRef } = useDroppable({
    id: slotId,
  })
  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-[1.75rem] border border-transparent p-1 transition ${className} ${
        isOver ? 'border-cyan-300/60 bg-cyan-400/10' : ''
      }`}
    >
      <AssetNode asset={asset} slotId={slotId} onDelete={onDeleteAsset} onEdit={onEditAsset} onViewHistory={onViewHistory} />
    </div>
  )
}
