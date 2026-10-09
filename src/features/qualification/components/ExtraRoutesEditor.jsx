import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { WEEKDAYS } from '@/constants/domain'
import { cn } from '@/lib/cn'

const EMPTY_ROUTE = { label: '', departure: '', destination: '', days: [], arrival_time: '', return_time: '', note: '' }

const input =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

/**
 * Extra routes / schedules: one employee per route (B2B), or a day with a
 * different schedule ("samedi : arrivée 10h00"). Free-form on purpose: no
 * field is required, every case is too specific to be validated.
 */
export function ExtraRoutesEditor({ value, onChange, dayOptions, label }) {
  const routes = value ?? []
  const days = dayOptions?.length ? dayOptions : WEEKDAYS.map((d) => ({ value: d, label: d }))

  const update = (index, patch) => onChange(routes.map((route, i) => (i === index ? { ...route, ...patch } : route)))
  const remove = (index) => {
    const next = routes.filter((_, i) => i !== index)
    onChange(next.length ? next : null)
  }
  const toggleDay = (index, day) => {
    const current = routes[index].days ?? []
    update(index, { days: current.includes(day) ? current.filter((d) => d !== day) : [...current, day] })
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>

      {routes.map((route, index) => (
        <div key={index} className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-50 text-xs font-bold text-brand-700">{index + 2}</span>
            <input
              className={input}
              placeholder="Nom (employé, « samedi »…)"
              value={route.label ?? ''}
              onChange={(e) => update(index, { label: e.target.value })}
              maxLength={255}
              aria-label={`Nom du trajet ${index + 2}`}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              aria-label={`Supprimer le trajet ${index + 2}`}
              title="Supprimer"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className={input}
              placeholder="Départ"
              value={route.departure ?? ''}
              onChange={(e) => update(index, { departure: e.target.value })}
              maxLength={255}
              aria-label="Départ"
            />
            <input
              className={input}
              placeholder="Destination"
              value={route.destination ?? ''}
              onChange={(e) => update(index, { destination: e.target.value })}
              maxLength={255}
              aria-label="Destination"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {days.map((day) => {
              const active = (route.days ?? []).includes(day.value)
              return (
                <button
                  key={day.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleDay(index, day.value)}
                  className={cn(
                    'rounded-md border px-2 py-1 text-xs font-medium',
                    active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300',
                  )}
                >
                  {day.label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <label className="text-xs text-slate-500">
              Arrivée (heure exacte)
              <input
                type="time"
                className={input}
                value={route.arrival_time ?? ''}
                onChange={(e) => update(index, { arrival_time: e.target.value || null })}
              />
            </label>
            <label className="text-xs text-slate-500">
              Retour
              <input
                type="time"
                className={input}
                value={route.return_time ?? ''}
                onChange={(e) => update(index, { return_time: e.target.value || null })}
              />
            </label>
            <label className="text-xs text-slate-500">
              Remarque
              <input
                className={input}
                value={route.note ?? ''}
                onChange={(e) => update(index, { note: e.target.value })}
                maxLength={500}
              />
            </label>
          </div>
        </div>
      ))}

      <Button variant="soft" size="sm" icon={Plus} onClick={() => onChange([...routes, { ...EMPTY_ROUTE }])}>
        Ajouter un trajet / horaire
      </Button>
    </div>
  )
}
