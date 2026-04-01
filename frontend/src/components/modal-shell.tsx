import type { ReactElement, ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalShellProps {
  readonly children: ReactNode
  readonly title: string
  readonly description?: string
  readonly onClose: () => void
}

export function ModalShell({ children, description, onClose, title }: ModalShellProps): ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <section className="panel-surface relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </section>
    </div>
  )
}
