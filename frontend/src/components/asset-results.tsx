import type { ReactElement } from 'react'
import type { AssetRecord } from '../types/asset-record'
import { AssetNode } from './asset-node'

interface AssetResultsProps {
  readonly assets: readonly AssetRecord[]
  readonly onDeleteAsset: (asset: AssetRecord) => void
  readonly onEditAsset: (asset: AssetRecord) => void
  readonly onViewHistory: (asset: AssetRecord) => void
}

export function AssetResults({
  assets,
  onDeleteAsset,
  onEditAsset,
  onViewHistory,
}: AssetResultsProps): ReactElement {
  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Busca</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Resultados filtrados</h2>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset: AssetRecord) => (
          <AssetNode
            key={asset.id}
            asset={asset}
            onDelete={onDeleteAsset}
            onEdit={onEditAsset}
            onViewHistory={onViewHistory}
          />
        ))}
      </div>
    </section>
  )
}
