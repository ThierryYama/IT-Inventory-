import type { ReactElement } from 'react'
import { Download, Plus, Search } from 'lucide-react'

interface SearchToolbarProps {
  readonly searchValue: string
  readonly visibleAssetsCount: number
  readonly visibleIslandsCount: number
  readonly onExportCsv: () => void
  readonly onOpenCreateAsset: () => void
  readonly onSearchChange: (value: string) => void
}

export function SearchToolbar({
  searchValue,
  visibleAssetsCount,
  visibleIslandsCount,
  onExportCsv,
  onOpenCreateAsset,
  onSearchChange,
}: SearchToolbarProps): ReactElement {
  return (
    <section className="panel-surface screen-only grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_auto]">
      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
        <Search className="size-4 text-cyan-300" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por nome, user, desktop, MAC ou patrimonio"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          {visibleAssetsCount} ativos visiveis
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          {visibleIslandsCount} ilhas
        </div>
        <button
          type="button"
          onClick={onOpenCreateAsset}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <Plus className="size-4" />
          Nova maquina
        </button>
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          <Download className="size-4" />
          Exportar CSV
        </button>
      </div>
    </section>
  )
}
