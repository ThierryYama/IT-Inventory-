import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { createSlotId } from '../helpers/create-slot-id'
import type { AssetRecord } from '../types/asset-record'
import type { AssetIsland } from '../types/asset-island'
import { IslandSlot } from './island-slot'

interface IslandCardProps {
  readonly island: AssetIsland
  readonly onDeleteAsset: (asset: AssetRecord) => void
  readonly onEditAsset: (asset: AssetRecord) => void
  readonly onViewHistory: (asset: AssetRecord) => void
}

function buildIslandSlots(island: AssetIsland): readonly (AssetRecord | undefined)[] {
  return Array.from({ length: island.capacity }, (_, index: number) =>
    island.assets.find((asset: AssetRecord) => asset.slotIndex === index + 1),
  )
}

export function IslandCard({ island, onDeleteAsset, onEditAsset, onViewHistory }: IslandCardProps): ReactElement {
  const islandSlots: readonly (AssetRecord | undefined)[] = buildIslandSlots(island)
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="panel-surface print-sheet relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute inset-8 rounded-full border border-cyan-300/10 bg-cyan-400/5" />
      <div className="pointer-events-none absolute inset-16 rounded-full border border-dashed border-violet-300/10" />
      <div className="relative mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Topologia visual</p>
          <h3 className="text-xl font-semibold text-white">{`Ilha ${island.sequenceNumber}`}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {island.assets.length} / {island.capacity} ativos
        </span>
      </div>
      <div className="relative grid gap-4 md:grid-cols-2">
        {islandSlots.map((asset: AssetRecord | undefined, index: number) => (
          <IslandSlot
            key={asset?.id ?? `island-${island.id}-slot-${index + 1}`}
            asset={asset}
            slotId={createSlotId(island.id, index + 1)}
            onDeleteAsset={onDeleteAsset}
            onEditAsset={onEditAsset}
            onViewHistory={onViewHistory}
          />
        ))}
      </div>
    </motion.section>
  )
}
