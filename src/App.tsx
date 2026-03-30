import { closestCenter, DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import type { ReactElement } from 'react'
import { Building2, LayoutGrid, MonitorSmartphone, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AssetNode } from './components/asset-node'
import { FileUploader } from './components/file-uploader'
import { EmptyState } from './components/empty-state'
import { SearchToolbar } from './components/search-toolbar'
import { SectorFilter } from './components/sector-filter'
import { SectorSection } from './components/sector-section'
import { spreadsheetColumns } from './constants/spreadsheet-columns'
import { filterSectorGroups } from './helpers/filter-sector-groups'
import { groupAssetsBySector } from './helpers/group-assets-by-sector'
import { parseSlotId } from './helpers/parse-slot-id'
import { parseSpreadsheetFile } from './helpers/parse-spreadsheet-file'
import { updateAssetPositionsAfterDrop } from './helpers/update-asset-positions-after-drop'
import type { AssetRecord } from './types/asset-record'
import type { SectorGroup } from './types/sector-group'

interface SummaryCard {
  readonly label: string
  readonly value: number
  readonly icon: typeof Building2
}

export function App(): ReactElement {
  const [assetRecords, setAssetRecords] = useState<readonly AssetRecord[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isParsing, setIsParsing] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedSectorId, setSelectedSectorId] = useState<string>('all')
  const [activeAssetId, setActiveAssetId] = useState<string>('')
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )
  const sectorGroups: readonly SectorGroup[] = useMemo(() => groupAssetsBySector(assetRecords), [assetRecords])
  const filteredSectorGroups: readonly SectorGroup[] = useMemo(
    () => filterSectorGroups({ sectorGroups, searchValue, selectedSectorId }),
    [searchValue, sectorGroups, selectedSectorId],
  )
  const activeAsset: AssetRecord | undefined = useMemo(
    () => assetRecords.find((asset: AssetRecord) => asset.id === activeAssetId),
    [activeAssetId, assetRecords],
  )
  const visibleAssetsCount: number = filteredSectorGroups.reduce(
    (total: number, sectorGroup: SectorGroup) => total + sectorGroup.assets.length,
    0,
  )
  const visibleIslandsCount: number = filteredSectorGroups.reduce(
    (total: number, sectorGroup: SectorGroup) => total + sectorGroup.islands.length,
    0,
  )
  const summaryCards: readonly SummaryCard[] = [
    { label: 'Ativos importados', value: assetRecords.length, icon: MonitorSmartphone },
    { label: 'Setores mapeados', value: sectorGroups.length, icon: Building2 },
    { label: 'Ilhas geradas', value: sectorGroups.reduce((total: number, sectorGroup: SectorGroup) => total + sectorGroup.islands.length, 0), icon: LayoutGrid },
  ]
  async function handleFileSelect(file: File): Promise<void> {
    try {
      setIsParsing(true)
      setErrorMessage('')
      const parsedAssets: readonly AssetRecord[] = await parseSpreadsheetFile(file)
      setAssetRecords(parsedAssets)
      setFileName(file.name)
      setSelectedSectorId('all')
      setSearchValue('')
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Nao foi possivel ler a planilha informada.')
      setAssetRecords([])
      setFileName('')
    } finally {
      setIsParsing(false)
    }
  }
  function handlePrint(): void {
    window.print()
  }
  function handleDragStart(event: DragStartEvent): void {
    setActiveAssetId(String(event.active.id))
  }
  function handleDragEnd(event: DragEndEvent): void {
    setActiveAssetId('')
    if (!event.over) {
      return
    }
    const parsedSlotId = parseSlotId(String(event.over.id))
    if (!parsedSlotId) {
      return
    }
    setAssetRecords((currentAssetRecords: readonly AssetRecord[]) =>
      updateAssetPositionsAfterDrop({
        assetRecords: currentAssetRecords,
        activeAssetId: String(event.active.id),
        targetSectorId: parsedSlotId.sectorId,
        targetPositionIndex: parsedSlotId.positionIndex,
      }),
    )
  }
  function handleDragCancel(): void {
    setActiveAssetId('')
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-6 p-4 lg:p-8">
        <header className="panel-surface print-sheet overflow-hidden px-6 py-8 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.32em] text-cyan-200">
                <Upload className="size-3.5" />
                Visualizador de ativos
              </div>
              <div className="space-y-3">
                <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                  Organize computadores por setor e gere ilhas visuais a partir da planilha
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                  Importe um arquivo Excel ou CSV, agrupe os ativos automaticamente e visualize cada ilha com ate 4 computadores para consulta rapida, auditoria e impressao em PDF.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {summaryCards.map((card: SummaryCard) => {
                const Icon = card.icon
                return (
                  <article key={card.label} className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">{card.label}</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
                      </div>
                      <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                        <Icon className="size-5" />
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </header>
        <div className="grid flex-1 gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <aside className="space-y-6">
            <FileUploader
              fileName={fileName}
              errorMessage={errorMessage}
              isParsing={isParsing}
              onFileSelect={handleFileSelect}
            />
            <SectorFilter
              sectorGroups={sectorGroups}
              selectedSectorId={selectedSectorId}
              onSelectSector={setSelectedSectorId}
            />
            <section className="panel-surface screen-only space-y-4 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Colunas esperadas</p>
                <h2 className="mt-2 text-lg font-semibold text-white">Mapeamento flexivel</h2>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                O parser aceita variacoes dos nomes abaixo e organiza tudo automaticamente.
              </p>
              <div className="flex flex-wrap gap-2">
                {spreadsheetColumns.map((columnName) => (
                  <span
                    key={columnName}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                  >
                    {columnName}
                  </span>
                ))}
              </div>
            </section>
          </aside>
          <main className="space-y-6">
            <SearchToolbar
              searchValue={searchValue}
              visibleAssetsCount={visibleAssetsCount}
              visibleIslandsCount={visibleIslandsCount}
              onPrint={handlePrint}
              onSearchChange={setSearchValue}
            />
            <section className="screen-only rounded-3xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100">
              Arraste um card para outro slot do mesmo setor para trocar a posicao dos computadores na ilha.
            </section>
            {filteredSectorGroups.length === 0 ? (
              <EmptyState hasData={assetRecords.length > 0} />
            ) : (
              <div className="space-y-8">
                {filteredSectorGroups.map((sectorGroup: SectorGroup) => (
                  <SectorSection key={sectorGroup.id} sectorGroup={sectorGroup} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <DragOverlay>
        {activeAsset ? <AssetNode asset={activeAsset} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
