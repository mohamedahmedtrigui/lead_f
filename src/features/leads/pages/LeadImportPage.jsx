import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FileSpreadsheet, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { Alert, Button, Card, CardHeader, Checkbox, PageHeader, Select, Spinner } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import { errorMessage } from '@/lib/http'
import { leadsApi } from '../api/leadsApi'

const EXPECTED_COLUMNS = 'Created, Name, Email, Source, Form, Channel, Stage, Owner, Labels, Phone, Secondary phone number, WhatsApp number'

export default function LeadImportPage() {
  const inputRef = useRef(null)
  const queryClient = useQueryClient()
  const history = useQuery({ queryKey: ['lead-imports'], queryFn: leadsApi.imports })
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [distribute, setDistribute] = useState(true)
  const [strategy, setStrategy] = useState('round_robin')
  const [result, setResult] = useState(null)
  const [uploading, setUploading] = useState(false)
  const confirm = useConfirm()

  async function upload() {
    if (distribute) {
      const ok = await confirm({
        title: `Importer « ${file.name} » et distribuer ?`,
        description:
          'Les nouveaux leads non assignés seront répartis automatiquement entre les dispatchers actifs (' +
          (strategy === 'balanced' ? 'équilibrage de charge' : 'round-robin') +
          '). Les leads existants ne sont jamais modifiés.',
        confirmLabel: 'Importer et distribuer',
      })
      if (!ok) return
    }
    setUploading(true)
    setResult(null)
    try {
      const response = await leadsApi.importCsv({ file, distribute, strategy })
      setResult(response)
      setFile(null)
      toast.success('Import terminé')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['lead-imports'] }),
        queryClient.invalidateQueries({ queryKey: ['leads'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ])
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) setFile(dropped)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Import CSV" description="Les données sources sont mises à jour sans jamais écraser la qualification ni le statut des leads." />

      <Card>
        <CardHeader icon={FileSpreadsheet} title="Importer un fichier" description={`Colonnes attendues : ${EXPECTED_COLUMNS}`} />
        <div className="space-y-5 p-5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
              dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-brand-50/40',
            )}
          >
            <Upload className="mb-3 size-8 text-brand-500" />
            <span className="font-medium text-slate-800">{file ? file.name : 'Glissez votre fichier CSV ici ou cliquez pour parcourir'}</span>
            <span className="mt-1 text-xs text-slate-500">{file ? `${(file.size / 1024).toFixed(1)} Ko` : 'Format .csv, 5 Mo maximum'}</span>
          </button>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

          <div className="flex flex-wrap items-center gap-4">
            <Checkbox label="Distribuer automatiquement les leads non assignés" checked={distribute} onChange={(e) => setDistribute(e.target.checked)} />
            {distribute && (
              <Select
                className="w-60"
                aria-label="Stratégie"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                options={[
                  { value: 'round_robin', label: 'Round-robin (5 / 4 / 4)' },
                  { value: 'balanced', label: 'Équilibrage de charge' },
                ]}
              />
            )}
          </div>

          <Button icon={Upload} disabled={!file} loading={uploading} onClick={upload}>
            Importer
          </Button>

          {result && (
            <Alert tone="success" title="Import terminé">
              {result.import.created_count} créé(s) · {result.import.updated_count} mis à jour · {result.import.skipped_count} ignoré(s) ou fusionné(s)
              {result.distribution && ` · ${Object.values(result.distribution).reduce((a, b) => a + b, 0)} lead(s) distribués`}
              {result.import.errors?.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs">
                  {result.import.errors.slice(0, 10).map((e) => (
                    <li key={e.line}>
                      Ligne {e.line} : {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </Alert>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Historique des imports" actions={history.isFetching && <Spinner className="size-4" />} />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fichier</th>
                <th className="px-4 py-3">Par</th>
                <th className="px-4 py-3 text-right">Lignes</th>
                <th className="px-4 py-3 text-right">Créés</th>
                <th className="px-4 py-3 text-right">Mis à jour</th>
                <th className="px-4 py-3 text-right">Ignorés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {(history.data ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(item.created_at)}</td>
                  <td className="px-4 py-3 font-medium">{item.file_name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.user ?? 'Ligne de commande'}</td>
                  <td className="px-4 py-3 text-right">{item.total_rows}</td>
                  <td className="px-4 py-3 text-right text-emerald-700">{item.created_count}</td>
                  <td className="px-4 py-3 text-right">{item.updated_count}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{item.skipped_count}</td>
                </tr>
              ))}
              {history.data?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Aucun import.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
