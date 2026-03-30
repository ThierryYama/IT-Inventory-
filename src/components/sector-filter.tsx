import type { ReactElement } from 'react'
import type { SectorGroup } from '../types/sector-group'

interface SectorFilterProps {
  readonly sectorGroups: readonly SectorGroup[]
  readonly selectedSectorId: string
  readonly onSelectSector: (sectorId: string) => void
}

export function SectorFilter({ sectorGroups, selectedSectorId, onSelectSector }: SectorFilterProps): ReactElement {
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
            selectedSectorId === 'all'
              ? 'bg-cyan-400 text-slate-950'
              : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
          }`}
        >
          <span>Todos os setores</span>
          <span>{sectorGroups.length}</span>
        </button>
        {sectorGroups.map((sectorGroup: SectorGroup) => (
          <button
            key={sectorGroup.id}
            type="button"
            onClick={() => onSelectSector(sectorGroup.id)}
            className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition ${
              selectedSectorId === sectorGroup.id
                ? 'bg-cyan-400 text-slate-950'
                : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            <span className="truncate">{sectorGroup.sectorName}</span>
            <span>{sectorGroup.assets.length}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
