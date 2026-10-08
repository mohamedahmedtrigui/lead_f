import { ArrowRight, MapPin, Navigation } from 'lucide-react'
import { Checkbox, Field, Input } from '@/components/ui'
import { WEEKDAYS } from '@/constants/domain'
import { isB2b } from '../config/steps'
import { OptionCards } from '../components/OptionCards'

const toNumber = (value) => (value === '' ? null : Number(value))

/** LEVEL 4 — Route. */
export function RouteStep({ answers, setField, errors, optionsFor, prompt }) {
  return (
    <div className="space-y-5">
      <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Field label="Départ" required error={errors.departure}>
          {(id) => (
            <div className="relative">
              <Navigation className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-500" />
              <input
                id={id}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="Ex. : Sfax, route de Tunis km 4"
                value={answers.departure ?? ''}
                onChange={(e) => setField('departure', e.target.value)}
                maxLength={255}
              />
            </div>
          )}
        </Field>
        <ArrowRight className="mx-auto mt-9 hidden size-5 text-slate-400 sm:block" />
        <Field label="Destination" required error={errors.destination}>
          {(id) => (
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rose-500" />
              <input
                id={id}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="Ex. : Centre-ville, école…"
                value={answers.destination ?? ''}
                onChange={(e) => setField('destination', e.target.value)}
                maxLength={255}
              />
            </div>
          )}
        </Field>
      </div>

      <Field label={prompt('trip_type', 'Aller simple ou aller-retour ?')} required error={errors.trip_type}>
        <OptionCards shortcuts options={optionsFor('trip_type')} value={answers.trip_type} onChange={(v) => setField('trip_type', v)} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          type="time"
          label={prompt('departure_time', 'Heure de départ')}
          value={answers.departure_time ?? ''}
          onChange={(e) => setField('departure_time', e.target.value || null)}
          error={errors.departure_time}
        />
        {answers.trip_type === 'ROUND_TRIP' && (
          <Input
            type="time"
            label={prompt('return_time', 'Heure de retour')}
            value={answers.return_time ?? ''}
            onChange={(e) => setField('return_time', e.target.value || null)}
            error={errors.return_time}
          />
        )}
      </div>
    </div>
  )
}

/** LEVEL 5 — Frequency. */
export function ScheduleStep({ answers, setField, errors, optionsFor, prompt }) {
  const dayOptions = optionsFor('days_of_week').length
    ? optionsFor('days_of_week')
    : WEEKDAYS.map((d) => ({ value: d, label: d }))
  const showDays = answers.frequency && answers.frequency !== 'ONE_TIME'

  const setFrequency = (value) => {
    setField('frequency', value)
    // Sensible default the dispatcher can still untick.
    setField('is_recurring', value !== 'ONE_TIME')
    if (value === 'DAILY' && !(answers.days_of_week ?? []).length) {
      setField('days_of_week', ['MON', 'TUE', 'WED', 'THU', 'FRI'])
    }
  }

  return (
    <div className="space-y-5">
      <OptionCards shortcuts options={optionsFor('frequency')} value={answers.frequency} onChange={setFrequency} error={errors.frequency} />

      {showDays && (
        <Field label={prompt('days_of_week', 'Quels jours ?')} required={answers.frequency === 'FIXED_DAYS'} error={errors.days_of_week}>
          <OptionCards
            multiple
            compact
            columns={7}
            options={dayOptions}
            value={answers.days_of_week ?? []}
            onChange={(v) => {
              setField('days_of_week', v)
              if (!answers.trips_per_week && v.length) setField('trips_per_week', v.length * (answers.trip_type === 'ROUND_TRIP' ? 2 : 1))
            }}
          />
        </Field>
      )}

      <div className="grid items-end gap-4 sm:grid-cols-2">
        <Input
          type="number"
          min={0}
          max={100}
          label={prompt('trips_per_week', 'Trajets par semaine')}
          value={answers.trips_per_week ?? ''}
          onChange={(e) => setField('trips_per_week', toNumber(e.target.value))}
          error={errors.trips_per_week}
        />
        <Checkbox
          className="pb-2"
          label={prompt('is_recurring', 'Besoin récurrent')}
          description="Le trajet se répète dans le temps"
          checked={!!answers.is_recurring}
          onChange={(e) => setField('is_recurring', e.target.checked)}
        />
      </div>
    </div>
  )
}

/** LEVEL 6 — Passengers (B2B fields when relevant). */
export function PassengersStep({ answers, setField, errors, prompt }) {
  const b2b = isB2b(answers)

  return (
    <div className="space-y-4">
      {!b2b && (
        <Field label="Nombre de passagers" required error={errors.passengers_count}>
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setField('passengers_count', n)}
                className={
                  answers.passengers_count === n
                    ? 'size-12 rounded-xl bg-brand-600 text-lg font-bold text-white shadow-md'
                    : 'size-12 rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-700 hover:border-brand-300'
                }
              >
                {n}
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={500}
              aria-label="Autre nombre de passagers"
              placeholder="7+"
              className="h-12 w-24 rounded-xl border border-slate-300 px-3 text-center text-lg shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              value={answers.passengers_count > 6 ? answers.passengers_count : ''}
              onChange={(e) => setField('passengers_count', toNumber(e.target.value))}
            />
          </div>
        </Field>
      )}

      {b2b && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            type="number"
            min={0}
            label={prompt('total_employees', 'Employés concernés au total')}
            value={answers.total_employees ?? ''}
            onChange={(e) => setField('total_employees', toNumber(e.target.value))}
            error={errors.total_employees}
          />
          <Input
            type="number"
            min={1}
            required
            label={prompt('estimated_passengers_per_trip', 'Passagers par trajet')}
            value={answers.estimated_passengers_per_trip ?? ''}
            onChange={(e) => setField('estimated_passengers_per_trip', toNumber(e.target.value))}
            error={errors.estimated_passengers_per_trip}
          />
        </div>
      )}
    </div>
  )
}
