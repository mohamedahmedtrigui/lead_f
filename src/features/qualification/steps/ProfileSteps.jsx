import { Building2 } from 'lucide-react'
import { Field, Input, Stars, Textarea } from '@/components/ui'
import { OptionCards } from '../components/OptionCards'

const toNumber = (value) => (value === '' ? null : Number(value))

/** LEVEL 7 — Shared transportation. */
export function SharedStep({ answers, setField, errors, optionsFor, prompt }) {
  return (
    <div className="space-y-5">
      <OptionCards
        shortcuts
        columns={3}
        options={optionsFor('shared_transport')}
        value={answers.shared_transport}
        onChange={(v) => setField('shared_transport', v)}
        error={errors.shared_transport}
      />
      {answers.shared_transport === 'YES' && (
        <Field label={prompt('shared_direction', 'Dans quel sens ?')} required error={errors.shared_direction}>
          <OptionCards columns={3} options={optionsFor('shared_direction')} value={answers.shared_direction} onChange={(v) => setField('shared_direction', v)} />
        </Field>
      )}
    </div>
  )
}

/** LEVEL 8 — Previous MiralDrive experience. */
export function ExperienceStep({ answers, setField, errors, optionsFor, prompt }) {
  return (
    <div className="space-y-5">
      <OptionCards
        shortcuts
        columns={3}
        options={optionsFor('used_miraldrive')}
        value={answers.used_miraldrive}
        onChange={(v) => setField('used_miraldrive', v)}
        error={errors.used_miraldrive}
      />
      {answers.used_miraldrive === 'YES' && (
        <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <Field label={prompt('experience_rating', 'Note de l’expérience')} required error={errors.experience_rating}>
            <Stars size="lg" label="Expérience" value={answers.experience_rating} onChange={(v) => setField('experience_rating', v)} />
          </Field>
          <Textarea
            rows={2}
            label={prompt('experience_feedback', 'Retour du client')}
            value={answers.experience_feedback ?? ''}
            onChange={(e) => setField('experience_feedback', e.target.value)}
            maxLength={2000}
          />
          <Textarea
            rows={2}
            label={prompt('improvement_request', 'Améliorations souhaitées')}
            value={answers.improvement_request ?? ''}
            onChange={(e) => setField('improvement_request', e.target.value)}
            maxLength={2000}
          />
        </div>
      )}
    </div>
  )
}

/** LEVEL 9 — Current transportation solution & pain points. */
export function CurrentSolutionStep({ answers, setField, errors, optionsFor, prompt }) {
  return (
    <div className="space-y-5">
      <OptionCards
        shortcuts
        columns={2}
        options={optionsFor('current_provider')}
        value={answers.current_provider}
        onChange={(v) => setField('current_provider', v)}
        error={errors.current_provider}
      />
      {answers.current_provider && answers.current_provider !== 'NO' && (
        <Input
          label={prompt('current_provider_details', 'Précisions')}
          value={answers.current_provider_details ?? ''}
          onChange={(e) => setField('current_provider_details', e.target.value)}
          maxLength={255}
        />
      )}
      <Textarea
        rows={2}
        label={prompt('customer_preference', 'Ce qui plaît au client')}
        value={answers.customer_preference ?? ''}
        onChange={(e) => setField('customer_preference', e.target.value)}
        maxLength={2000}
      />
      <Textarea
        rows={2}
        label={prompt('pain_point', 'Ce qui pose problème')}
        value={answers.pain_point ?? ''}
        onChange={(e) => setField('pain_point', e.target.value)}
        maxLength={2000}
      />
    </div>
  )
}

/** LEVEL 10 — B2B qualification (only for employees / company needs). */
export function B2bStep({ answers, setField, errors, optionsFor, prompt }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
        <Building2 className="size-4" />
        Besoin entreprise détecté
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={prompt('company_name', 'Nom de l’entreprise')}
          required
          value={answers.company_name ?? ''}
          onChange={(e) => setField('company_name', e.target.value)}
          error={errors.company_name}
          maxLength={255}
        />
        <Input
          type="number"
          min={0}
          label={prompt('company_size', 'Taille de l’entreprise')}
          value={answers.company_size ?? ''}
          onChange={(e) => setField('company_size', toNumber(e.target.value))}
          error={errors.company_size}
        />
        <Input
          type="number"
          min={0}
          label={prompt('employees_concerned', 'Employés concernés')}
          value={answers.employees_concerned ?? ''}
          onChange={(e) => setField('employees_concerned', toNumber(e.target.value))}
          error={errors.employees_concerned}
        />
        <Input
          type="number"
          min={0}
          label={prompt('trips_per_day', 'Trajets par jour')}
          value={answers.trips_per_day ?? ''}
          onChange={(e) => setField('trips_per_day', toNumber(e.target.value))}
          error={errors.trips_per_day}
        />
      </div>
      <Field label="Rôle de l’interlocuteur dans la décision" required error={errors.decision_role}>
        <OptionCards shortcuts columns={3} options={optionsFor('decision_role')} value={answers.decision_role} onChange={(v) => setField('decision_role', v)} />
      </Field>
      {answers.decision_role && answers.decision_role !== 'DECISION_MAKER' && (
        <Input
          label={prompt('decision_maker_name', 'Nom du décideur')}
          value={answers.decision_maker_name ?? ''}
          onChange={(e) => setField('decision_maker_name', e.target.value)}
          maxLength={255}
        />
      )}
    </div>
  )
}

/** LEVEL 11 — Buying priorities (never start with price). */
export function PrioritiesStep({ answers, setField, errors, optionsFor }) {
  return (
    <OptionCards
      shortcuts
      columns={1}
      options={optionsFor('main_priority')}
      value={answers.main_priority}
      onChange={(v) => setField('main_priority', v)}
      error={errors.main_priority}
    />
  )
}
