import { Building2 } from 'lucide-react'
import { Field, Input, Stars, Textarea } from '@/components/ui'
import { OptionCards, YesNo } from '../components/OptionCards'

/** 6. Shared transportation (single person, outside B2B). */
export function SharedStep({ answers, setField, errors, optionsFor, prompt, reply }) {
  const roundTrip = answers.trip_type === 'ROUND_TRIP'

  const choose = (value) => {
    setField('shared_transport', value)
    if (value === 'YES' && !roundTrip) setField('shared_direction', 'OUTBOUND')
  }

  return (
    <div className="space-y-5">
      <OptionCards
        shortcuts
        columns={3}
        options={optionsFor('shared_transport')}
        value={answers.shared_transport}
        onChange={choose}
        error={errors.shared_transport}
        // The "Oui" reply asks aller / retour / les deux: only for a round trip.
        reply={answers.shared_transport === 'YES' && !roundTrip ? null : reply('shared_transport')}
      />
      {answers.shared_transport === 'YES' && !roundTrip && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Trajet <strong>aller seulement</strong> : le partage se fera à l’aller.
        </p>
      )}
      {answers.shared_transport === 'YES' && roundTrip && (
        <Field label={prompt('shared_direction', 'Sens du partage')} required error={errors.shared_direction}>
          <OptionCards columns={3} options={optionsFor('shared_direction')} value={answers.shared_direction} onChange={(v) => setField('shared_direction', v)} />
        </Field>
      )}
    </div>
  )
}

/** 7. Experience + current solution (one simple step). */
export function ExperienceStep({ answers, setField, errors, optionsFor, prompt, reply }) {
  const byApp = answers.current_provider === 'APPLICATION'

  return (
    <div className="space-y-5">
      {/* 1. MiralDrive */}
      <OptionCards
        shortcuts
        columns={3}
        options={optionsFor('used_miraldrive')}
        value={answers.used_miraldrive}
        onChange={(v) => setField('used_miraldrive', v)}
        error={errors.used_miraldrive}
        reply={reply('used_miraldrive')}
      />
      {answers.used_miraldrive === 'YES' && (
        <div className="grid items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-[auto_1fr]">
          <Field label={prompt('experience_rating', 'Note MiralDrive')} required error={errors.experience_rating}>
            <Stars label="Expérience" value={answers.experience_rating} onChange={(v) => setField('experience_rating', v)} />
          </Field>
          <Input
            label={prompt('experience_feedback', 'Son retour')}
            value={answers.experience_feedback ?? ''}
            onChange={(e) => setField('experience_feedback', e.target.value)}
            maxLength={2000}
          />
        </div>
      )}

      {/* 2. Today */}
      <Field label={prompt('current_provider', 'Comment se déplace-t-il aujourd’hui ?')} required error={errors.current_provider}>
        <OptionCards
          columns={2}
          options={optionsFor('current_provider')}
          value={answers.current_provider}
          onChange={(v) => setField('current_provider', v)}
          reply={reply('current_provider')}
        />
      </Field>

      {/* 3. Other apps: quick choices and/or free opinion — all optional */}
      {byApp && (
        <div className="space-y-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
          <Field label={prompt('other_apps', 'Quelle(s) application(s) ?')}>
            <OptionCards
              multiple
              compact
              columns={4}
              options={optionsFor('other_apps')}
              value={answers.other_apps ?? []}
              onChange={(v) => setField('other_apps', v.length ? v : null)}
            />
          </Field>
          <Field label={prompt('other_apps_issues', 'Problèmes rencontrés')}>
            <OptionCards
              multiple
              compact
              columns={2}
              options={optionsFor('other_apps_issues')}
              value={answers.other_apps_issues ?? []}
              onChange={(v) => setField('other_apps_issues', v.length ? v : null)}
            />
          </Field>
          <Textarea
            rows={2}
            label={prompt('other_apps_feedback', 'Son avis en quelques mots')}
            value={answers.other_apps_feedback ?? ''}
            onChange={(e) => setField('other_apps_feedback', e.target.value)}
            maxLength={2000}
          />
        </div>
      )}

      {/* 4. Difficulties */}
      <Textarea
        rows={2}
        label={prompt('pain_point', 'Difficultés rencontrées aujourd’hui')}
        value={answers.pain_point ?? ''}
        onChange={(e) => setField('pain_point', e.target.value)}
        maxLength={2000}
      />
    </div>
  )
}

/** 8. B2B qualification (only for employees / company needs). */
export function B2bStep({ answers, setField, errors, optionsFor, prompt, reply }) {
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
          label={prompt('company_size', 'Taille de l’entreprise')}
          placeholder="Ex. : environ 50, 20 à 30…"
          value={answers.company_size ?? ''}
          onChange={(e) => setField('company_size', e.target.value)}
          error={errors.company_size}
          maxLength={100}
        />
      </div>
      <Field label={prompt('b2b_same_schedule', 'Les trajets sont-ils aux mêmes horaires ?')}>
        <YesNo value={answers.b2b_same_schedule} onChange={(v) => setField('b2b_same_schedule', v)} />
      </Field>
      <Field label="Rôle de l’interlocuteur dans la décision" required error={errors.decision_role}>
        <OptionCards
          shortcuts
          columns={3}
          options={optionsFor('decision_role')}
          value={answers.decision_role}
          onChange={(v) => setField('decision_role', v)}
          reply={reply('decision_role')}
        />
      </Field>
      {answers.decision_role && answers.decision_role !== 'DECISION_MAKER' && (
        <Input
          label={prompt('decision_maker_name', 'Personne à contacter')}
          value={answers.decision_maker_name ?? ''}
          onChange={(e) => setField('decision_maker_name', e.target.value)}
          maxLength={255}
        />
      )}
    </div>
  )
}
