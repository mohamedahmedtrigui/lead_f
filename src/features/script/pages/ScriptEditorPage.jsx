import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, Button, Card, CardHeader, ErrorState, Input, PageHeader, PageLoader, Textarea } from '@/components/ui'
import { ScriptBlock } from '@/features/qualification/components/ScriptBlock'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/lib/format'
import { errorMessage, fieldErrors } from '@/lib/http'
import { scriptApi } from '../api/scriptApi'
import { scriptKeys } from '../hooks/useScript'

const FIELD_LABELS = {
  call_availability: 'Disponibilité',
  beneficiary: 'Bénéficiaire',
  beneficiary_details: 'Précisions bénéficiaire',
  transport_need: 'Type de déplacement',
  transport_need_details: 'Précisions besoin',
  trip_type: 'Type de trajet',
  departure_time: 'Heure de départ',
  return_time: 'Heure de retour',
  frequency: 'Fréquence',
  days_of_week: 'Jours',
  trips_per_week: 'Trajets / semaine',
  is_recurring: 'Récurrence',
  total_employees: 'Employés au total',
  estimated_passengers_per_trip: 'Passagers / trajet',
  shared_transport: 'Transport partagé',
  shared_direction: 'Sens du partage',
  used_miraldrive: 'Déjà client',
  experience_rating: 'Note expérience',
  experience_feedback: 'Retour',
  improvement_request: 'Améliorations',
  current_provider: 'Solution actuelle',
  current_provider_details: 'Précisions solution',
  customer_preference: 'Ce qui plaît',
  pain_point: 'Point de douleur',
  company_name: 'Entreprise',
  company_size: 'Taille',
  employees_concerned: 'Employés concernés',
  trips_per_day: 'Trajets / jour',
  decision_maker_name: 'Nom du décideur',
  decision_role: 'Rôle décisionnel',
  main_priority: 'Priorité principale',
  wants_quotation: 'Demande de devis',
  wants_callback: 'Demande de rappel',
  priority_stars: 'Étoiles',
  summary_note: 'Résumé',
  next_action: 'Prochaine action',
  callback_at: 'Date de rappel',
}

function toForm(step) {
  return {
    title: step.title ?? '',
    objective: step.objective ?? '',
    script: step.script ?? '',
    question: step.question ?? '',
    tips: step.tips ?? '',
    prompts: { ...(step.prompts ?? {}) },
    options: Object.fromEntries(
      Object.entries(step.options ?? {}).map(([field, options]) => [field, Object.fromEntries(options.map((o) => [o.value, o.label]))]),
    ),
  }
}

function StepEditor({ step, defaults, onSaved }) {
  const [form, setForm] = useState(() => toForm(step))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const promptKeys = Object.keys(defaults?.prompts ?? {})
  const optionFields = Object.keys(defaults?.options ?? {})

  async function save() {
    setSaving(true)
    setErrors({})
    try {
      await scriptApi.update(step.id, form)
      toast.success('Script enregistré : les dispatchers voient la nouvelle version')
      await onSaved()
    } catch (error) {
      setErrors(fieldErrors(error))
      toast.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  async function reset() {
    if (!window.confirm('Restaurer le texte par défaut de cette étape ?')) return
    try {
      const restored = await scriptApi.reset(step.id)
      setForm(toForm(restored))
      toast.success('Texte par défaut restauré')
      await onSaved()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  const preview = { ...step, ...form }

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader
          title={`Niveau ${step.position} · ${step.title}`}
          description={step.updated_at ? `Modifié le ${formatDateTime(step.updated_at)}${step.editor ? ` par ${step.editor}` : ''}` : null}
          actions={
            <>
              <Button variant="ghost" size="sm" icon={RotateCcw} onClick={reset}>
                Par défaut
              </Button>
              <Button size="sm" icon={Save} loading={saving} onClick={save}>
                Enregistrer
              </Button>
            </>
          }
        />
        <div className="space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Titre de l’étape" required value={form.title} onChange={set('title')} error={errors.title} maxLength={255} />
            <Input label="Objectif (pour le dispatcher)" value={form.objective} onChange={set('objective')} error={errors.objective} maxLength={255} />
          </div>
          <Textarea
            label="Discours à dire"
            hint="Séparez les paragraphes par une ligne vide."
            rows={5}
            value={form.script}
            onChange={set('script')}
            error={errors.script}
            maxLength={5000}
          />
          <Textarea label="Question principale" rows={2} value={form.question} onChange={set('question')} error={errors.question} maxLength={1000} />

          {promptKeys.length > 0 && (
            <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-700">Questions complémentaires</legend>
              {promptKeys.map((key) => (
                <Input
                  key={key}
                  label={FIELD_LABELS[key] ?? key}
                  value={form.prompts[key] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, prompts: { ...f.prompts, [key]: e.target.value } }))}
                  error={errors[`prompts.${key}`]}
                  maxLength={1000}
                />
              ))}
            </fieldset>
          )}

          {optionFields.map((field) => (
            <fieldset key={field} className="space-y-3 rounded-xl border border-slate-200 p-4">
              <legend className="px-1 text-sm font-semibold text-slate-700">Réponses : {FIELD_LABELS[field] ?? field}</legend>
              <div className="grid gap-3 md:grid-cols-2">
                {defaults.options[field].map((option) => (
                  <Input
                    key={option.value}
                    label={<span className="font-mono text-xs text-slate-500">{option.value}</span>}
                    value={form.options[field]?.[option.value] ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, options: { ...f.options, [field]: { ...f.options[field], [option.value]: e.target.value } } }))
                    }
                    error={errors[`options.${field}.${option.value}`]}
                    maxLength={120}
                  />
                ))}
              </div>
            </fieldset>
          ))}

          <Textarea label="Conseil au dispatcher" rows={2} value={form.tips} onChange={set('tips')} error={errors.tips} maxLength={2000} />
        </div>
      </Card>

      <Card className="self-start 2xl:sticky 2xl:top-6">
        <CardHeader icon={Eye} title="Aperçu dispatcher" />
        <div className="p-5">
          <ScriptBlock step={preview} />
          {optionFields[0] && (
            <div className="mt-4 flex flex-wrap gap-2">
              {defaults.options[optionFields[0]].map((option, i) => (
                <span key={option.value} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
                  <span className="mr-2 text-xs font-bold text-slate-400">{i + 1}</span>
                  {form.options[optionFields[0]]?.[option.value]}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function ScriptEditorPage() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin-script'], queryFn: scriptApi.adminSteps })
  const [selectedKey, setSelectedKey] = useState('introduction')

  if (query.isLoading) return <PageLoader />
  if (query.isError) return <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />

  const steps = query.data.data
  const step = steps.find((s) => s.key === selectedKey) ?? steps[0]

  const refresh = () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: ['admin-script'] }), queryClient.invalidateQueries({ queryKey: scriptKeys.all })])

  return (
    <div>
      <PageHeader title="Script d’appel" description="Le discours affiché aux dispatchers, étape par étape. Seuls les administrateurs peuvent le modifier." />
      <Alert tone="info" className="mb-4">
        Les textes et libellés sont modifiables. La structure (champs et valeurs enregistrés) reste fixe pour garantir la cohérence des données
        et du scoring.
      </Alert>
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="self-start p-2">
          <nav className="space-y-0.5" aria-label="Étapes du script">
            {steps.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedKey(s.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm',
                  s.key === step.key ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                  {s.position}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </nav>
        </Card>
        <StepEditor key={step.id + (step.updated_at ?? '')} step={step} defaults={query.data.defaults[step.key]} onSaved={refresh} />
      </div>
    </div>
  )
}
