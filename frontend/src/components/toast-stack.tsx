import { CheckCircle2, CircleAlert, X } from 'lucide-react'
import type { ReactElement } from 'react'

export interface ToastItem {
  readonly id: number
  readonly title: string
  readonly description: string
  readonly variant: 'success' | 'error'
}

interface ToastStackProps {
  readonly toasts: readonly ToastItem[]
  readonly onDismiss: (toastId: number) => void
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps): ReactElement | null {
  if (toasts.length === 0) {
    return null
  }
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast: ToastItem) => (
        <article
          key={toast.id}
          className={`pointer-events-auto rounded-3xl border p-4 shadow-2xl backdrop-blur ${
            toast.variant === 'success'
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-50'
              : 'border-rose-400/30 bg-rose-400/10 text-rose-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {toast.variant === 'success' ? <CheckCircle2 className="size-5" /> : <CircleAlert className="size-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              <p className="mt-1 text-sm opacity-90">{toast.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-2xl p-1 opacity-80 transition hover:bg-white/10 hover:opacity-100"
              aria-label="Fechar notificacao"
            >
              <X className="size-4" />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
