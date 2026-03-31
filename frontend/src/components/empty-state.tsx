import type { ReactElement } from 'react'
import { LayoutGrid, Upload } from 'lucide-react'

interface EmptyStateProps {
  readonly hasData: boolean
}

export function EmptyState({ hasData }: EmptyStateProps): ReactElement {
  if (!hasData) {
    return (
      <section className="panel-surface flex min-h-[28rem] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-cyan-400/10 p-4 text-cyan-300">
          <Upload className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Carregue sua planilha para gerar as ilhas</h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-400">
            O app organiza os computadores por setor, cria ilhas com ate 4 ativos e monta um layout pronto para consulta ou impressao.
          </p>
        </div>
      </section>
    )
  }
  return (
    <section className="panel-surface flex min-h-[20rem] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-violet-400/10 p-4 text-violet-300">
        <LayoutGrid className="size-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Nenhum ativo encontrado com os filtros atuais</h2>
        <p className="mx-auto max-w-xl text-sm text-slate-400">
          Ajuste a busca ou selecione outro setor para visualizar os computadores novamente.
        </p>
      </div>
    </section>
  )
}
