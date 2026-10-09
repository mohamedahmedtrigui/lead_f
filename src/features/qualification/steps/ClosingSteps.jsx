import { Wand2 } from 'lucide-react'
import { Alert, Button, Field, Input, Stars, Textarea } from '@/components/ui'
import { EXCLUSIVE_NEXT_ACTIONS, primaryNextAction } from '@/constants/domain'
import { isoToLocalInput, localInputToIso } from '@/lib/format'
import { OptionCards, YesNo } from '../components/OptionCards'
import { ScoreGauge } from '../components/ScoreGauge'
import { isEarlyExit } from '../config/steps'
import { SummaryView } from '../components/SummaryView'
import { buildSummaryDraft } from '../utils/summary'

/** 10. Recap read back to the client ("C'est bien ça ?"). */
export function RecapStep({ answers, setField, errors, optionsFor, reply }) {
  return (
    <YesNo
      shortcuts
      options={optionsFor('recap_confirmed')}
      value={answers.recap_confirmed}
      onChange={(v) => setField('recap_confirmed', v)}
      error={errors.recap_confirmed}
      reply={reply('recap_confirmed')}
    />
  )
}

/** Selecting "Pas intéressé" / "NRP" clears the others, and vice versa. */
function toggleAction(current, action) {
  if (current.includes(action)) return current.filter((a) => a !== action)
  if (EXCLUSIVE_NEXT_ACTIONS.includes(action)) return [action]
  return [...current.filter((a) => !EXCLUSIVE_NEXT_ACTIONS.includes(a)), action]
}

/** 11. Closing + agent evaluation: next actions (several), score, priority, summary. */
export function ClosingStep({ answers, setField, errors, optionsFor, prompt, label, reply, server }) {
  const actions = answers.next_actions ?? []
  const earlyExit = isEarlyExit(answers)

  const onActionsChange = (selected) => {
    const added = selected.find((a) => !actions.includes(a))
    const next = added ? toggleAction(actions, added) : selected
    setField('next_actions', next)
    // The main action drives the lead status and the closing speech shown.
    setField('next_action', primaryNextAction(next))
  }

  return (
    <div className="space-y-5">
      <Field
        label={prompt('next_action', 'Prochaine(s) action(s) — plusieurs choix possibles')}
        required
        error={errors.next_actions}
        hint="« Pas intéressé » et « NRP » ne se combinent pas avec d’autres actions."
      >
        <OptionCards multiple columns={2} options={optionsFor('next_action')} value={actions} onChange={onActionsChange} reply={reply('next_action')} />
      </Field>

      {actions.includes('CALLBACK') && (
        <Input
          type="datetime-local"
          required
          label={prompt('callback_at', 'Date et heure du rappel')}
          value={isoToLocalInput(answers.callback_at)}
          onChange={(e) => setField('callback_at', localInputToIso(e.target.value))}
          error={errors.callback_at}
        />
      )}

      {actions.includes('NRP') && (
        <Alert tone="warning">La communication a été coupée : une tentative NRP sera comptabilisée pour ce lead.</Alert>
      )}

      {!earlyExit && (
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 lg:grid-cols-2">
          <ScoreGauge score={server.interest_score ?? 0} level={server.interest_level ?? 'LOW'} breakdown={server.score_breakdown ?? []} />
          <div className="space-y-4">
            <Field label={prompt('priority_stars', 'Priorité commerciale')} required error={errors.priority_stars} hint="1 = faible, 5 = très forte.">
              <Stars size="lg" value={answers.priority_stars} onChange={(v) => setField('priority_stars', v)} />
            </Field>
            <Field label={prompt('main_priority', 'Priorité exprimée par le client (si mentionnée)')}>
              <OptionCards
                compact
                columns={2}
                options={optionsFor('main_priority')}
                value={answers.main_priority}
                onChange={(v) => setField('main_priority', v === answers.main_priority ? null : v)}
              />
            </Field>
          </div>
        </div>
      )}

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-700">
            Résumé interne de l’appel <span className="text-rose-500">*</span>
          </span>
          <Button size="xs" variant="soft" icon={Wand2} onClick={() => setField('summary_note', buildSummaryDraft(answers, label))}>
            Générer un brouillon
          </Button>
        </div>
        <Textarea
          rows={5}
          placeholder={prompt('summary_note', 'Trajet, horaires, fréquence, passagers, partage, solution actuelle, motivation…')}
          value={answers.summary_note ?? ''}
          onChange={(e) => setField('summary_note', e.target.value)}
          error={errors.summary_note}
          maxLength={5000}
        />
      </div>
    </div>
  )
}

/** 12. Final internal summary, reviewed before completing the qualification. */
export function SummaryStep({ lead, answers, server, goTo }) {
  return <SummaryView lead={lead} answers={answers} server={server} onEdit={goTo} />
}
