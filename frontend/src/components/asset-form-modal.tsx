import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react'
import type { AssetFormValues } from '../types/asset-form-values'
import type { AssetRecord } from '../types/asset-record'
import { ModalShell } from './modal-shell'

interface AssetFormModalProps {
  readonly asset?: AssetRecord
  readonly isSubmitting: boolean
  readonly onClose: () => void
  readonly onSubmit: (values: AssetFormValues) => Promise<void>
}

interface FieldDefinition {
  readonly key: keyof AssetFormValues
  readonly label: string
  readonly required?: boolean
}

const fieldDefinitions: readonly FieldDefinition[] = [
  { key: 'name', label: 'Nome', required: true },
  { key: 'sectorName', label: 'Setor', required: true },
  { key: 'desktopName', label: 'Desktop' },
  { key: 'userName', label: 'User' },
  { key: 'ipAddress', label: 'IP' },
  { key: 'macAddress', label: 'MAC' },
  { key: 'wifiMacAddress', label: 'MAC WI-FI' },
  { key: 'modelName', label: 'Modelo' },
  { key: 'processor', label: 'Processador' },
  { key: 'memory', label: 'Memoria' },
  { key: 'storage', label: 'Disco' },
  { key: 'brand', label: 'Marca' },
  { key: 'partNumber', label: 'Partnumber' },
  { key: 'patrimony', label: 'Patrimonio' },
  { key: 'assetType', label: 'Tipo' },
  { key: 'operatingSystem', label: 'SO' },
] as const

function buildInitialValues(asset?: AssetRecord): AssetFormValues {
  return {
    name: asset?.name ?? '',
    sectorName: asset?.sectorName ?? '',
    ipAddress: asset?.ipAddress ?? '',
    macAddress: asset?.macAddress ?? '',
    wifiMacAddress: asset?.wifiMacAddress ?? '',
    modelName: asset?.modelName ?? '',
    userName: asset?.userName ?? '',
    processor: asset?.processor ?? '',
    memory: asset?.memory ?? '',
    storage: asset?.storage ?? '',
    brand: asset?.brand ?? '',
    partNumber: asset?.partNumber ?? '',
    patrimony: asset?.patrimony ?? '',
    desktopName: asset?.desktopName ?? '',
    assetType: asset?.assetType ?? '',
    operatingSystem: asset?.operatingSystem ?? '',
  }
}

export function AssetFormModal({ asset, isSubmitting, onClose, onSubmit }: AssetFormModalProps): ReactElement {
  const [formValues, setFormValues] = useState<AssetFormValues>(() => buildInitialValues(asset))
  useEffect(() => {
    setFormValues(buildInitialValues(asset))
  }, [asset])
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    await onSubmit(formValues)
  }
  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const fieldName: keyof AssetFormValues = event.target.name as keyof AssetFormValues
    setFormValues((currentValues: AssetFormValues) => ({
      ...currentValues,
      [fieldName]: event.target.value,
    }))
  }
  return (
    <ModalShell
      title={asset ? 'Editar maquina' : 'Nova maquina'}
      description="Os dados enviados por este formulario serao persistidos no backend."
      onClose={onClose}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          {fieldDefinitions.map((fieldDefinition: FieldDefinition) => (
            <label key={fieldDefinition.key} className="space-y-2">
              <span className="text-sm font-medium text-slate-200">{fieldDefinition.label}</span>
              <input
                required={fieldDefinition.required}
                name={fieldDefinition.key}
                value={formValues[fieldDefinition.key]}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
              />
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : asset ? 'Salvar alteracoes' : 'Criar maquina'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
