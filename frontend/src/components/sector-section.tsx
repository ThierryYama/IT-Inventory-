import type { ReactElement } from 'react'
import type { AssetRecord } from '../types/asset-record'
import { motion } from 'framer-motion'
import type { SectorGroup } from '../types/sector-group'
import { IslandCard } from './island-card'

interface SectorSectionProps {
  readonly sectorGroup: SectorGroup
  readonly onDeleteAsset: (asset: AssetRecord) => void
  readonly onEditAsset: (asset: AssetRecord) => void
  readonly onViewHistory: (asset: AssetRecord) => void
}

export function SectorSection({
  sectorGroup,
  onDeleteAsset,
  onEditAsset,
  onViewHistory,
}: SectorSectionProps): ReactElement {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Setor</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{sectorGroup.sectorName}</h2>
        </div>
        <div className="flex gap-3 text-sm text-slate-300">
          <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2">
            {sectorGroup.assetCount} computadores
          </span>
          <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2">
            {sectorGroup.islandCount} ilhas
          </span>
        </div>
      </header>
      <div className="grid gap-5 2xl:grid-cols-2">
        {sectorGroup.islands.map((island) => (
          <IslandCard
            key={island.id}
            island={island}
            onDeleteAsset={onDeleteAsset}
            onEditAsset={onEditAsset}
            onViewHistory={onViewHistory}
          />
        ))}
      </div>
    </motion.section>
  )
}
