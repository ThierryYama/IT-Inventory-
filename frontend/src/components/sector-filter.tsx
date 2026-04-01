import type { ReactElement } from 'react'
import type { SectorSummary } from '../types/sector-summary'

interface SectorFilterProps {
  readonly sectors: readonly SectorSummary[]
  readonly selectedSectorName: string
  readonly onSelectSector: (sectorName: string) => void
}

export function SectorFilter({ sectors, selectedSectorName, onSelectSector }: SectorFilterProps): ReactElement {
  return (
    <section className="panel-surface screen-only space-y-4 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Filtros</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Setores</h2>
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => onSelectSector('all')}
          className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition ${
            selectedSectorName === 'all'
              ? 'bg-cyan-400 text-slate-950'
              : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
          }`}
        >
          <span>Todos os setores</span>
          <span>{sectors.length}</span>
        </button>
        {sectors.map((sector) => (
          <button
            key={sector.id}
            type="button"
            onClick={() => onSelectSector(sector.name)}
            className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition ${
              selectedSectorName === sector.name
                ? 'bg-cyan-400 text-slate-950'
                : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            <span className="truncate">{sector.name}</span>
            <span>{sector.assetCount}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
