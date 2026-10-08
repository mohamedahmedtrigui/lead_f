import { ArrowRight, MapPin, Navigation, Repeat } from 'lucide-react'
import { Checkbox, Field, Input } from '@/components/ui'
import { WEEKDAYS } from '@/constants/domain'
import { isB2b } from '../config/steps'
import { OptionCards } from '../components/OptionCards'

const toNumber = (value) => (value === '' ? null : Number(value))

const placeInput =
  'h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'

/** 4. Route and frequency. */
export function RouteStep({ answers, setField, errors, optionsFor, prompt }) {
  const dayOptions = optionsFor('days_of_week').length ? optionsFor('days_of_week') : WEEKDAYS.map((d) => ({ value: d, label: d }))
  const showDays = answers.frequency && answers.frequency !== 'ONE_TIME'

  const setFrequency = (value) => {
    setField('frequency', value)
    // Sensible defaults the dispatcher can still change.
    setField('is_recurring', value !== 'ONE_TIME')
    if (value === 'DAILY' && !(answers.days_of_week ?? []).length) {
      setField('days_of_week', ['MON', 'TUE', 'WED', 'THU', 'FRI'])
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid items-start gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Field label="Départ" required error={errors.departure}>
          {(id) => (
            <div className="relative">
              <Navigation className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-500" />
              <input
                id={id}
                className={placeInput}
                placeholder="Ex. : Sfax, route de Tunis km 4"
                value={answers.departure ?? ''}
                onChange={(e) => setField('departure', e.target.value)}
                maxLength={255}
              />
            </div>
          )}
        </Field>
        <ArrowRight className="mx-auto mt-9 hidden size-5 text-slate-400 sm:block" />
        <Field label={prompt('destination', 'Destination')} required error={errors.destination}>
          {(id) => (
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-rose-500" />
              <input
                id={id}
                className={placeInput}
                placeholder="Ex. : Centre-ville, école…"
                value={answers.destination ?? ''}
                onChange={(e) => setField('destination', e.target.value)}
                maxLength={255}
              />
            </div>
          )}
        </Field>
      </div>

      <Field label={prompt('trip_type', 'Aller seulement ou aller-retour ?')} required error={errors.trip_type}>
        <OptionCards
          shortcuts
          options={optionsFor('trip_type')}
          value={answers.trip_type}
          onChange={(v) => {
            setField('trip_type', v)
            // No return leg: a shared trip can only be shared on the way out.
            if (v !== 'ROUND_TRIP' && answers.shared_transport === 'YES') setField('shared_direction', 'OUTBOUND')
          }}
        />
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

      {/* Frequency (same section of the script) */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Repeat className="size-4 text-brand-600" />
          {prompt('frequency', 'Fréquence')} <span className="text-rose-500">*</span>
        </p>
        <OptionCards options={optionsFor('frequency')} value={answers.frequency} onChange={setFrequency} error={errors.frequency} />

        {showDays && (
          <Field label={prompt('days_of_week', 'Jours concernés')} required={answers.frequency === 'FIXED_DAYS'} error={errors.days_of_week}>
            <OptionCards
              multiple
              compact
              columns={7}
              options={dayOptions}
              value={answers.days_of_week ?? []}
              onChange={(v) => setField('days_of_week', v)}
            />
          </Field>
        )}

        <div className="grid items-end gap-4 sm:grid-cols-3">
          <Input
            type="number"
            min={0}
            max={1000}
            label={prompt('trips_per_day', 'Trajets par jour')}
            value={answers.trips_per_day ?? ''}
            onChange={(e) => setField('trips_per_day', toNumber(e.target.value))}
            error={errors.trips_per_day}
          />
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
            checked={!!answers.is_recurring}
            onChange={(e) => setField('is_recurring', e.target.checked)}
          />
        </div>
      </div>
    </div>
  )
}

/** 5. Passengers (B2B fields when relevant). */
export function PassengersStep({ answers, setField, errors, prompt }) {
  const b2b = isB2b(answers)

  return (
    <div className="space-y-4">
      {!b2b && (
        <Field
          label="Nombre de passagers"
          required
          error={errors.passengers_count}
          hint={`Si plusieurs personnes : « ${prompt('passengers_count', '9addeh تقريباً ?')} »`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* One vehicle: 4 passengers max */}
            {[1, 2, 3, 4].map((n) => (
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
