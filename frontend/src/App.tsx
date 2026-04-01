import { closestCenter, DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, LayoutGrid, MonitorSmartphone, Upload } from 'lucide-react'
import { useMemo, useState, type ReactElement } from 'react'
import { AssetFormModal } from './components/asset-form-modal'
import { AssetHistoryModal } from './components/asset-history-modal'
import { IslandCreateModal } from './components/island-create-modal'
import { AssetNode } from './components/asset-node'
import { AssetResults } from './components/asset-results'
import { EmptyState } from './components/empty-state'
import { FileUploader } from './components/file-uploader'
import { SearchToolbar } from './components/search-toolbar'
import { SectorFilter } from './components/sector-filter'
import { SectorSection } from './components/sector-section'
import { ToastStack, type ToastItem } from './components/toast-stack'
import { spreadsheetColumns } from './constants/spreadsheet-columns'
import { parseSlotId } from './helpers/parse-slot-id'
import { inventoryApi } from './services/api'
import type { AssetIsland } from './types/asset-island'
import type { AssetFormValues } from './types/asset-form-values'
import type { AssetRecord } from './types/asset-record'
import type { SectorGroup } from './types/sector-group'
import type { SectorSummary } from './types/sector-summary'

interface SummaryCard {
  readonly label: string
  readonly value: number
  readonly icon: typeof Building2
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error) {
    return error.message
  }
  return fallbackMessage
}

export function App(): ReactElement {
  const queryClient = useQueryClient()
  const [fileName, setFileName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const [selectedSectorName, setSelectedSectorName] = useState<string>('all')
  const [activeAssetId, setActiveAssetId] = useState<number | null>(null)
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null)
  const [historyAsset, setHistoryAsset] = useState<AssetRecord | null>(null)
  const [creatingIslandSectorName, setCreatingIslandSectorName] = useState<string | null>(null)
  const [isAssetFormOpen, setIsAssetFormOpen] = useState<boolean>(false)
  const [toasts, setToasts] = useState<readonly ToastItem[]>([])
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )
  const sectorsQuery = useQuery({
    queryKey: ['sectors'],
    queryFn: () => inventoryApi.fetchSectors(),
  })
  const sectorGroupQueries = useQueries({
    queries:
      searchValue === '' && selectedSectorName === 'all' && sectorsQuery.data
        ? sectorsQuery.data.map((sector: SectorSummary) => ({
            queryKey: ['sector-group', sector.name],
            queryFn: () => inventoryApi.fetchSectorGroup(sector.name),
          }))
        : [],
  })
  const selectedSectorQuery = useQuery({
    enabled: searchValue === '' && selectedSectorName !== 'all',
    queryKey: ['sector-group', selectedSectorName],
    queryFn: () => inventoryApi.fetchSectorGroup(selectedSectorName),
  })
  const assetsSearchQuery = useQuery({
    enabled: searchValue !== '',
    queryKey: ['assets', selectedSectorName, searchValue],
    queryFn: () =>
      inventoryApi.fetchAssets({
        search: searchValue,
        sector: selectedSectorName === 'all' ? undefined : selectedSectorName,
      }),
  })
  const assetHistoryQuery = useQuery({
    enabled: historyAsset !== null,
    queryKey: ['asset-history', historyAsset?.id],
    queryFn: () => inventoryApi.fetchAssetHistory(historyAsset!.id),
  })
  async function invalidateInventoryQueries(): Promise<void> {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['sectors'] }),
      queryClient.invalidateQueries({ queryKey: ['sector-group'] }),
      queryClient.invalidateQueries({ queryKey: ['assets'] }),
      queryClient.invalidateQueries({ queryKey: ['asset-history'] }),
    ])
  }
  function dismissToast(toastId: number): void {
    setToasts((currentToasts: readonly ToastItem[]) => currentToasts.filter((toast: ToastItem) => toast.id !== toastId))
  }
  function showToast(title: string, description: string, variant: ToastItem['variant']): void {
    const toastId: number = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((currentToasts: readonly ToastItem[]) => [
      ...currentToasts,
      { id: toastId, title, description, variant },
    ])
    window.setTimeout(() => {
      dismissToast(toastId)
    }, 4500)
  }
  const importInventoryMutation = useMutation({
    mutationFn: (file: File) => inventoryApi.importInventory(file),
    onSuccess: async (result, file: File) => {
      setErrorMessage('')
      setFileName(file.name)
      setSelectedSectorName('all')
      setSearchValue('')
      await invalidateInventoryQueries()
      showToast(
        'Importacao concluida',
        `${result.createdCount} maquinas criadas e ${result.updatedCount} atualizadas a partir de ${file.name}.`,
        'success',
      )
    },
    onError: (error: unknown) => {
      const message: string = getErrorMessage(error, 'Nao foi possivel importar a planilha informada.')
      setErrorMessage(message)
      showToast('Falha na importacao', message, 'error')
    },
  })
  const createAssetMutation = useMutation({
    mutationFn: (values: AssetFormValues) => inventoryApi.createAsset(values),
    onSuccess: async (asset: AssetRecord) => {
      await invalidateInventoryQueries()
      setIsAssetFormOpen(false)
      setEditingAsset(null)
      setErrorMessage('')
      showToast('Maquina criada', `${asset.name} foi cadastrada com sucesso.`, 'success')
    },
    onError: (error: unknown) => {
      const message: string = getErrorMessage(error, 'Nao foi possivel criar a maquina.')
      setErrorMessage(message)
      showToast('Falha ao criar maquina', message, 'error')
    },
  })
  const updateAssetMutation = useMutation({
    mutationFn: ({ assetId, values }: { assetId: number; values: AssetFormValues }) => inventoryApi.updateAsset(assetId, values),
    onSuccess: async (asset: AssetRecord) => {
      await invalidateInventoryQueries()
      setIsAssetFormOpen(false)
      setEditingAsset(null)
      setErrorMessage('')
      showToast('Maquina atualizada', `${asset.name} foi atualizada com sucesso.`, 'success')
    },
    onError: (error: unknown) => {
      const message: string = getErrorMessage(error, 'Nao foi possivel atualizar a maquina.')
      setErrorMessage(message)
      showToast('Falha ao atualizar maquina', message, 'error')
    },
  })
  const deleteAssetMutation = useMutation({
    mutationFn: (assetId: number) => inventoryApi.deleteAsset(assetId),
    onSuccess: async () => {
      await invalidateInventoryQueries()
      setErrorMessage('')
    },
    onError: (error: unknown) => {
      const message: string = getErrorMessage(error, 'Nao foi possivel excluir a maquina.')
      setErrorMessage(message)
      showToast('Falha ao excluir maquina', message, 'error')
    },
  })
  const moveAssetMutation = useMutation({
    mutationFn: ({ assetId, targetIslandId, targetSlotIndex }: { assetId: number; targetIslandId: number; targetSlotIndex: number }) =>
      inventoryApi.moveAsset(assetId, { targetIslandId, targetSlotIndex }),
    onSuccess: async (asset: AssetRecord) => {
      await invalidateInventoryQueries()
      setErrorMessage('')
      showToast(
        'Maquina movida',
        `${asset.name} agora esta na ilha ${asset.islandSequenceNumber ?? '-'} no slot ${asset.slotIndex ?? '-'}.`,
        'success',
      )
    },
    onError: (error: unknown) => {
      const message: string = getErrorMessage(error, 'Nao foi possivel mover a maquina informada.')
      setErrorMessage(message)
      showToast('Falha ao mover maquina', message, 'error')
    },
  })
  const createIslandMutation = useMutation({
    mutationFn: ({ sectorName, capacity }: { sectorName: string; capacity: number }) => inventoryApi.createIsland(sectorName, capacity),
    onSuccess: async (island) => {
      await invalidateInventoryQueries()
      setCreatingIslandSectorName(null)
      setErrorMessage('')
      showToast(
        'Ilha criada',
        `A ilha ${island.sequenceNumber} foi criada com ${island.capacity} slots.`,
        'success',
      )
    },
    onError: (error: unknown) => {
      const message: string = getErrorMessage(error, 'Nao foi possivel criar a ilha informada.')
      setErrorMessage(message)
      showToast('Falha ao criar ilha', message, 'error')
    },
  })
  const deleteIslandMutation = useMutation({
    mutationFn: (islandId: number) => inventoryApi.deleteIsland(islandId),
    onSuccess: async () => {
      await invalidateInventoryQueries()
      setErrorMessage('')
    },
    onError: (error: unknown) => {
      const message: string = getErrorMessage(error, 'Nao foi possivel excluir a ilha informada.')
      setErrorMessage(message)
      showToast('Falha ao excluir ilha', message, 'error')
    },
  })
  const sectors: readonly SectorSummary[] = sectorsQuery.data ?? []
  const sectorGroups: readonly SectorGroup[] = useMemo(() => {
    if (searchValue !== '') {
      return []
    }
    if (selectedSectorName === 'all') {
      return sectorGroupQueries.flatMap((query) => (query.data ? [query.data] : []))
    }
    return selectedSectorQuery.data ? [selectedSectorQuery.data] : []
  }, [searchValue, sectorGroupQueries, selectedSectorName, selectedSectorQuery.data])
  const searchedAssets: readonly AssetRecord[] = useMemo(() => assetsSearchQuery.data ?? [], [assetsSearchQuery.data])
  const activeAsset: AssetRecord | undefined = useMemo(() => {
    const allVisibleAssets: readonly AssetRecord[] =
      searchValue !== '' ? searchedAssets : sectorGroups.flatMap((sectorGroup: SectorGroup) => sectorGroup.assets)
    return allVisibleAssets.find((asset: AssetRecord) => asset.id === activeAssetId)
  }, [activeAssetId, searchValue, searchedAssets, sectorGroups])
  const totalAssetsCount: number = sectors.reduce((total: number, sector: SectorSummary) => total + sector.assetCount, 0)
  const totalIslandsCount: number = sectors.reduce((total: number, sector: SectorSummary) => total + sector.islandCount, 0)
  const visibleAssetsCount: number =
    searchValue !== ''
      ? searchedAssets.length
      : sectorGroups.reduce((total: number, sectorGroup: SectorGroup) => total + sectorGroup.assets.length, 0)
  const visibleIslandsCount: number =
    searchValue !== ''
      ? 0
      : sectorGroups.reduce((total: number, sectorGroup: SectorGroup) => total + sectorGroup.islands.length, 0)
  const summaryCards: readonly SummaryCard[] = [
    { label: 'Ativos importados', value: totalAssetsCount, icon: MonitorSmartphone },
    { label: 'Setores mapeados', value: sectors.length, icon: Building2 },
    { label: 'Ilhas geradas', value: totalIslandsCount, icon: LayoutGrid },
  ]
  const isLoadingInventory: boolean =
    sectorsQuery.isLoading ||
    selectedSectorQuery.isLoading ||
    sectorGroupQueries.some((query) => query.isLoading) ||
    assetsSearchQuery.isLoading
  async function handleExportCsv(): Promise<void> {
    try {
      const blob: Blob = await inventoryApi.exportAssetsCsv()
      const downloadUrl: string = window.URL.createObjectURL(blob)
      const anchorElement: HTMLAnchorElement = document.createElement('a')
      anchorElement.href = downloadUrl
      anchorElement.download = 'inventory-export.csv'
      anchorElement.click()
      window.URL.revokeObjectURL(downloadUrl)
      showToast('Exportacao concluida', 'O CSV do inventario foi gerado com sucesso.', 'success')
    } catch (error: unknown) {
      const message: string = getErrorMessage(error, 'Nao foi possivel exportar o CSV do inventario.')
      setErrorMessage(message)
      showToast('Falha na exportacao', message, 'error')
    }
  }
  async function handleFileSelect(file: File): Promise<void> {
    await importInventoryMutation.mutateAsync(file)
  }
  function handleDragStart(event: DragStartEvent): void {
    const assetId: unknown = event.active.data.current?.assetId
    setActiveAssetId(typeof assetId === 'number' ? assetId : null)
  }
  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    const currentActiveAssetId: number | null = activeAssetId
    setActiveAssetId(null)
    if (currentActiveAssetId === null || !event.over) {
      return
    }
    const parsedSlotId = parseSlotId(String(event.over.id))
    if (!parsedSlotId) {
      return
    }
    await moveAssetMutation.mutateAsync({
      assetId: currentActiveAssetId,
      targetIslandId: parsedSlotId.islandId,
      targetSlotIndex: parsedSlotId.slotIndex,
    })
  }
  function handleDragCancel(): void {
    setActiveAssetId(null)
  }
  function handleOpenCreateAsset(): void {
    setEditingAsset(null)
    setIsAssetFormOpen(true)
  }
  function handleOpenCreateIsland(sectorName: string): void {
    setCreatingIslandSectorName(sectorName)
  }
  function handleEditAsset(asset: AssetRecord): void {
    setEditingAsset(asset)
    setIsAssetFormOpen(true)
  }
  function handleDeleteIsland(island: AssetIsland): void {
    const shouldDelete: boolean = window.confirm(`Deseja excluir a ilha ${island.sequenceNumber}?`)
    if (!shouldDelete) {
      return
    }
    void deleteIslandMutation.mutateAsync(island.id, {
      onSuccess: async () => {
        await invalidateInventoryQueries()
        setErrorMessage('')
        showToast('Ilha excluida', `A ilha ${island.sequenceNumber} foi removida com sucesso.`, 'success')
      },
    })
  }
  async function handleSubmitIslandForm(capacity: number): Promise<void> {
    if (creatingIslandSectorName === null) {
      return
    }
    await createIslandMutation.mutateAsync({
      sectorName: creatingIslandSectorName,
      capacity,
    })
  }
  async function handleSubmitAssetForm(values: AssetFormValues): Promise<void> {
    if (editingAsset) {
      await updateAssetMutation.mutateAsync({ assetId: editingAsset.id, values })
      return
    }
    await createAssetMutation.mutateAsync(values)
  }
  function handleDeleteAsset(asset: AssetRecord): void {
    const shouldDelete: boolean = window.confirm(`Deseja excluir a maquina ${asset.name}?`)
    if (!shouldDelete) {
      return
    }
    void deleteAssetMutation.mutateAsync(asset.id, {
      onSuccess: async () => {
        await invalidateInventoryQueries()
        setErrorMessage('')
        showToast('Maquina excluida', `${asset.name} foi removida do inventario.`, 'success')
      },
    })
  }
  function handleCloseAssetForm(): void {
    if (createAssetMutation.isPending || updateAssetMutation.isPending) {
      return
    }
    setIsAssetFormOpen(false)
    setEditingAsset(null)
  }
  function handleOpenHistory(asset: AssetRecord): void {
    setHistoryAsset(asset)
  }
  function handleCloseHistory(): void {
    setHistoryAsset(null)
  }
  function handleCloseIslandForm(): void {
    if (createIslandMutation.isPending) {
      return
    }
    setCreatingIslandSectorName(null)
  }
  return (
    <>
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
                    Organize computadores por setor e gere ilhas visuais a partir da API de inventario
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                    O frontend agora importa arquivos pelo backend, consome os setores e ativos persistidos no banco e executa
                    movimentacoes e CRUD diretamente pela API.
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
                hasImportedData={totalAssetsCount > 0}
                isParsing={importInventoryMutation.isPending}
                onFileSelect={handleFileSelect}
              />
              <SectorFilter sectors={sectors} selectedSectorName={selectedSectorName} onSelectSector={setSelectedSectorName} />
              <section className="panel-surface screen-only space-y-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Colunas esperadas</p>
                  <h2 className="mt-2 text-lg font-semibold text-white">Mapeamento flexivel</h2>
                </div>
                <p className="text-sm leading-6 text-slate-400">
                  O backend aceita variacoes dos nomes abaixo e organiza tudo automaticamente.
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
                onExportCsv={() => void handleExportCsv()}
                onOpenCreateAsset={handleOpenCreateAsset}
                onSearchChange={setSearchValue}
              />
              <section className="screen-only rounded-3xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-100">
                Arraste uma maquina para outro slot da ilha para sincronizar o movimento via backend.
              </section>
              {isLoadingInventory ? (
                <section className="panel-surface flex min-h-[18rem] items-center justify-center p-8 text-center text-slate-300">
                  Carregando inventario...
                </section>
              ) : null}
              {!isLoadingInventory && searchValue !== '' ? (
                searchedAssets.length === 0 ? (
                  <EmptyState hasData={totalAssetsCount > 0} />
                ) : (
                  <AssetResults
                    assets={searchedAssets}
                    onDeleteAsset={handleDeleteAsset}
                    onEditAsset={handleEditAsset}
                    onViewHistory={handleOpenHistory}
                  />
                )
              ) : null}
              {!isLoadingInventory && searchValue === '' ? (
                sectorGroups.length === 0 ? (
                  <EmptyState hasData={totalAssetsCount > 0} />
                ) : (
                  <div className="space-y-8">
                    {sectorGroups.map((sectorGroup: SectorGroup) => (
                      <SectorSection
                        key={sectorGroup.id}
                        sectorGroup={sectorGroup}
                        onOpenCreateIsland={handleOpenCreateIsland}
                        onDeleteIsland={handleDeleteIsland}
                        onDeleteAsset={handleDeleteAsset}
                        onEditAsset={handleEditAsset}
                        onViewHistory={handleOpenHistory}
                      />
                    ))}
                  </div>
                )
              ) : null}
            </main>
          </div>
        </div>
        <DragOverlay>{activeAsset ? <AssetNode asset={activeAsset} isDragOverlay /> : null}</DragOverlay>
      </DndContext>
      {isAssetFormOpen ? (
        <AssetFormModal
          asset={editingAsset ?? undefined}
          isSubmitting={createAssetMutation.isPending || updateAssetMutation.isPending}
          onClose={handleCloseAssetForm}
          onSubmit={handleSubmitAssetForm}
        />
      ) : null}
      {historyAsset ? (
        <AssetHistoryModal
          asset={historyAsset}
          historyEntries={assetHistoryQuery.data ?? []}
          isLoading={assetHistoryQuery.isLoading}
          onClose={handleCloseHistory}
        />
      ) : null}
      {creatingIslandSectorName ? (
        <IslandCreateModal
          isSubmitting={createIslandMutation.isPending}
          sectorName={creatingIslandSectorName}
          onClose={handleCloseIslandForm}
          onSubmit={handleSubmitIslandForm}
        />
      ) : null}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}
