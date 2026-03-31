import { useDroppable } from '@dnd-kit/core'
import type { ReactElement } from 'react'
import type { AssetRecord } from '../types/asset-record'
import { AssetNode } from './asset-node'

interface IslandSlotProps {
  readonly asset?: AssetRecord
  readonly slotId: string
}

export function IslandSlot({ asset, slotId }: IslandSlotProps): ReactElement {
  const { isOver, setNodeRef } = useDroppable({
    id: slotId,
  })
  return (
    <div
      ref={setNodeRef}
      className={`relative rounded-[1.75rem] border border-transparent p-1 transition ${
        isOver ? 'border-cyan-300/60 bg-cyan-400/10' : ''
      }`}
    >
      <AssetNode asset={asset} slotId={slotId} />
    </div>
  )
}
