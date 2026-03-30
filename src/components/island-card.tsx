import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { islandSize } from '../constants/island-size'
import { createSlotId } from '../helpers/create-slot-id'
import type { AssetRecord } from '../types/asset-record'
import type { AssetIsland } from '../types/asset-island'
import { IslandSlot } from './island-slot'

interface IslandCardProps {
  readonly sectorId: string
  readonly island: AssetIsland
}

function buildIslandSlots(assets: readonly AssetRecord[]): readonly (AssetRecord | undefined)[] {
  return Array.from({ length: islandSize }, (_, index: number) =>
    assets.find((asset: AssetRecord) => asset.positionIndex === index),
  )
}

export function IslandCard({ sectorId, island }: IslandCardProps): ReactElement {
  const islandSlots: readonly (AssetRecord | undefined)[] = buildIslandSlots(
    island.assets.map((asset: AssetRecord) => ({
      ...asset,
      positionIndex: asset.positionIndex - island.slotStartIndex,
    })),
  )
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
          <h3 className="text-xl font-semibold text-white">{island.name}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {island.assets.length} / {islandSize} ativos
        </span>
      </div>
      <div className="relative grid gap-4 md:grid-cols-2">
        {islandSlots.map((asset: AssetRecord | undefined, index: number) => (
          <IslandSlot
            key={asset?.id ?? `${island.id}-slot-${index + 1}`}
            asset={asset}
            slotId={createSlotId(sectorId, island.slotStartIndex + index)}
          />
        ))}
      </div>
    </motion.section>
  )
}
