import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { ModalShell } from './modal-shell'

interface IslandCreateModalProps {
  readonly isSubmitting: boolean
  readonly sectorName: string
  readonly onClose: () => void
  readonly onSubmit: (capacity: number) => Promise<void>
}

export function IslandCreateModal({
  isSubmitting,
  sectorName,
  onClose,
  onSubmit,
}: IslandCreateModalProps): ReactElement {
  const [capacityValue, setCapacityValue] = useState<string>('4')

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const parsedCapacity: number = Number(capacityValue)
    if (!Number.isInteger(parsedCapacity) || parsedCapacity < 1) {
      return
    }
    await onSubmit(parsedCapacity)
  }

  return (
    <ModalShell
      title={`Nova ilha em ${sectorName}`}
      description="Defina quantos slots essa ilha deve ter."
      onClose={onClose}
    >
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Quantidade de slots</span>
          <input
            type="number"
            min={1}
            max={8}
            step={1}
            value={capacityValue}
            onChange={(event) => setCapacityValue(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-cyan-300/60"
          />
        </label>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Criando...' : 'Criar ilha'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
