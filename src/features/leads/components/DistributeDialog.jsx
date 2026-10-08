import { useState } from 'react'
import { Shuffle } from 'lucide-react'
import { Alert, Button, Checkbox, Modal } from '@/components/ui'
import { useActiveDispatchers } from '@/features/dispatchers/hooks/useDispatchers'
import { cn } from '@/lib/cn'

const STRATEGIES = [
  {
    value: 'round_robin',
    title: 'Round-robin',
    description: 'Répartition équitable du lot : 13 leads / 3 dispatchers = 5 / 4 / 4.',
  },
  {
    value: 'balanced',
    title: 'Équilibrage de charge',
    description: 'Priorité aux dispatchers ayant le moins de leads ouverts.',
  },
]

/** Automatic distribution of unassigned leads (or of the selected ones). */
export function DistributeDialog({ selectedCount, onClose, onSubmit }) {
  const dispatchers = useActiveDispatchers()
  const [strategy, setStrategy] = useState('round_robin')
  const [picked, setPicked] = useState(null) // null = every active dispatcher
  const [submitting, setSubmitting] = useState(false)
  const ids = picked ?? (dispatchers.data ?? []).map((d) => d.id)

  const toggle = (id) => setPicked(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])

  async function submit() {
    setSubmitting(true)
    try {
      await onSubmit({ strategy, dispatcher_ids: ids })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Distribution automatique"
      description={selectedCount ? `${selectedCount} lead(s) sélectionné(s) seront distribués.` : 'Tous les leads ouverts non assignés seront distribués.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button icon={Shuffle} loading={submitting} disabled={!ids?.length} onClick={submit}>
            Distribuer
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {STRATEGIES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStrategy(option.value)}
              className={cn(
                'rounded-xl border p-4 text-left transition',
                strategy === option.value ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-300',
              )}
            >
              <p className="font-semibold text-slate-900">{option.title}</p>
              <p className="mt-1 text-xs text-slate-500">{option.description}</p>
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Dispatchers concernés</p>
          {dispatchers.data?.length === 0 && <Alert tone="warning">Aucun dispatcher actif.</Alert>}
          <div className="grid gap-2 sm:grid-cols-2">
            {(dispatchers.data ?? []).map((d) => (
              <Checkbox
                key={d.id}
                className="rounded-lg border border-slate-200 p-3"
                label={d.full_name}
                description={`${d.open_leads_count ?? 0} lead(s) ouvert(s)`}
                checked={ids?.includes(d.id) ?? false}
                onChange={() => toggle(d.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
