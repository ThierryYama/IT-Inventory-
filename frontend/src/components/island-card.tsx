import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { createSlotId } from '../helpers/create-slot-id'
import type { AssetRecord } from '../types/asset-record'
import type { AssetIsland } from '../types/asset-island'
import { IslandSlot } from './island-slot'

interface IslandCardProps {
  readonly island: AssetIsland
  readonly onDeleteIsland: (island: AssetIsland) => void
  readonly onDeleteAsset: (asset: AssetRecord) => void
  readonly onEditAsset: (asset: AssetRecord) => void
  readonly onViewHistory: (asset: AssetRecord) => void
}

function buildIslandSlots(island: AssetIsland): readonly (AssetRecord | undefined)[] {
  return Array.from({ length: island.capacity }, (_, index: number) =>
    island.assets.find((asset: AssetRecord) => asset.slotIndex === index + 1),
  )
}

interface IslandLayoutConfig {
  readonly cardWidth: string
  readonly columns: number
  readonly slotWidth: string
}

function getIslandLayoutConfig(capacity: number): IslandLayoutConfig {
  if (capacity === 1) {
    return {
      cardWidth: '22rem',
      columns: 1,
      slotWidth: '16rem',
    }
  }
  if (capacity === 2) {
    return {
      cardWidth: '38rem',
      columns: 2,
      slotWidth: '16rem',
    }
  }
  if (capacity === 3) {
    return {
      cardWidth: '54rem',
      columns: 3,
      slotWidth: '16rem',
    }
  }
  if (capacity === 4) {
    return {
      cardWidth: '38rem',
      columns: 2,
      slotWidth: '16rem',
    }
  }
  if (capacity <= 6) {
    return {
      cardWidth: '54rem',
      columns: 3,
      slotWidth: '16rem',
    }
  }
  if (capacity === 7) {
    return {
      cardWidth: '70rem',
      columns: 4,
      slotWidth: '16rem',
    }
  }
  return {
    cardWidth: '70rem',
    columns: 4,
    slotWidth: '16rem',
  }
}

export function IslandCard({
  island,
  onDeleteIsland,
  onDeleteAsset,
  onEditAsset,
  onViewHistory,
}: IslandCardProps): ReactElement {
  const islandSlots: readonly (AssetRecord | undefined)[] = buildIslandSlots(island)
  const layoutConfig: IslandLayoutConfig = getIslandLayoutConfig(island.capacity)
  const isIslandEmpty: boolean = island.assetCount === 0
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      style={{ width: `min(100%, ${layoutConfig.cardWidth})` }}
      className="panel-surface print-sheet relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute inset-8 rounded-full border border-cyan-300/10 bg-cyan-400/5" />
      <div className="pointer-events-none absolute inset-16 rounded-full border border-dashed border-violet-300/10" />
      <div className="relative mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Topologia visual</p>
          <h3 className="text-xl font-semibold text-white">{`Ilha ${island.sequenceNumber}`}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {island.assets.length} / {island.capacity} ativos
          </span>
          {isIslandEmpty ? (
            <button
              type="button"
              onClick={() => onDeleteIsland(island)}
              className="rounded-full border border-rose-300/20 bg-rose-400/10 p-2 text-rose-100 transition hover:bg-rose-400/15"
              aria-label={`Excluir ilha ${island.sequenceNumber}`}
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </div>
      </div>
      <div
        className="relative grid justify-center gap-4"
        style={{
          gridTemplateColumns: `repeat(${layoutConfig.columns}, minmax(${layoutConfig.slotWidth}, ${layoutConfig.slotWidth}))`,
        }}
      >
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
