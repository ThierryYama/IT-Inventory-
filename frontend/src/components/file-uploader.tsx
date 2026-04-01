import { Download, FileSpreadsheet, RefreshCcw, Upload } from 'lucide-react'
import { useRef, type ChangeEvent, type DragEvent, type ReactElement } from 'react'

interface FileUploaderProps {
  readonly fileName: string
  readonly errorMessage: string
  readonly hasImportedData: boolean
  readonly isParsing: boolean
  readonly onFileSelect: (file: File) => Promise<void>
}

function isSpreadsheetFile(file: File): boolean {
  return /\.(xlsx|xls|csv)$/i.test(file.name)
}

export function FileUploader({
  fileName,
  errorMessage,
  hasImportedData,
  isParsing,
  onFileSelect,
}: FileUploaderProps): ReactElement {
  const inputReference = useRef<HTMLInputElement | null>(null)
  async function handleFile(file: File): Promise<void> {
    if (!isSpreadsheetFile(file)) {
      return
    }
    await onFileSelect(file)
  }
  async function handleInputChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const selectedFile: File | undefined = event.target.files?.[0]
    if (!selectedFile) {
      return
    }
    await handleFile(selectedFile)
    event.target.value = ''
  }
  async function handleDrop(event: DragEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault()
    const droppedFile: File | undefined = event.dataTransfer.files?.[0]
    if (!droppedFile) {
      return
    }
    await handleFile(droppedFile)
  }
  return (
    <section className="panel-surface screen-only space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-cyan-300/80">Importacao</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Planilha de ativos</h2>
        </div>
        <FileSpreadsheet className="size-5 text-cyan-300" />
      </div>
      <button
        type="button"
        onClick={() => inputReference.current?.click()}
        onDragOver={(event: DragEvent<HTMLButtonElement>) => event.preventDefault()}
        onDrop={handleDrop}
        className="flex w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/5 px-4 py-8 text-center transition hover:border-cyan-300 hover:bg-cyan-400/10"
      >
        <div className="rounded-full bg-cyan-400/10 p-3 text-cyan-300">
          {isParsing ? <RefreshCcw className="size-5 animate-spin" /> : <Upload className="size-5" />}
        </div>
        <div className="space-y-1">
          <p className="font-medium text-white">
            {isParsing ? 'Enviando planilha...' : 'Clique ou arraste um arquivo .xlsx, .xls ou .csv'}
          </p>
          <p className="text-sm text-slate-400">A importacao e processada pelo backend e salva no banco de dados.</p>
        </div>
      </button>
      <input
        ref={inputReference}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="space-y-2 text-sm text-slate-300">
        <p className="font-medium text-white">Arquivo atual</p>
        <p className="truncate rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          {fileName === '' ? 'Nenhum arquivo carregado' : fileName}
        </p>
        <p className="text-xs leading-5 text-slate-400">
          {hasImportedData
            ? 'Os dados exibidos refletem o inventario salvo no backend.'
            : 'Importe uma planilha para popular o inventario persistido no backend.'}
        </p>
      </div>
      <div className="grid gap-2">
        <a
          href="/assets-exemplo.csv"
          download="assets-exemplo.csv"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:border-cyan-300 hover:bg-cyan-400/10"
        >
          <Download className="size-4" />
          Baixar CSV de exemplo
        </a>
      </div>
      {errorMessage !== '' ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-3 py-3 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}
    </section>
  )
}
