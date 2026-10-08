import { Wand2 } from 'lucide-react'
import { Alert, Button, Checkbox, Field, Input, Stars, Textarea } from '@/components/ui'
import { isoToLocalInput, localInputToIso } from '@/lib/format'
import { OptionCards, YesNo } from '../components/OptionCards'
import { ScoreGauge } from '../components/ScoreGauge'
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

/** 11. Agent evaluation: computed score + dispatcher priority (internal). */
export function QualificationStep({ answers, setField, errors, prompt, optionsFor, server }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <ScoreGauge score={server.interest_score ?? 0} level={server.interest_level ?? 'LOW'} breakdown={server.score_breakdown ?? []} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Checkbox
          label={prompt('wants_quotation', 'Le client demande un devis')}
          checked={!!answers.wants_quotation}
          onChange={(e) => setField('wants_quotation', e.target.checked)}
        />
        <Checkbox
          label={prompt('wants_callback', 'Le client souhaite être rappelé')}
          checked={!!answers.wants_callback}
          onChange={(e) => setField('wants_callback', e.target.checked)}
        />
      </div>
      <Field label={prompt('priority_stars', 'Priorité commerciale')} required error={errors.priority_stars} hint="Votre ressenti sur l’opportunité (1 = faible, 5 = très forte).">
        <Stars size="lg" value={answers.priority_stars} onChange={(v) => setField('priority_stars', v)} />
      </Field>
      <Field label={prompt('main_priority', 'Priorité exprimée par le client (si mentionnée)')}>
        <OptionCards
          columns={3}
          options={optionsFor('main_priority')}
          value={answers.main_priority}
          onChange={(v) => setField('main_priority', v === answers.main_priority ? null : v)}
        />
      </Field>
    </div>
  )
}

/** 12. Closing: next action (with its closing speech) + internal summary. */
export function ClosingStep({ answers, setField, errors, optionsFor, prompt, label, reply }) {
  return (
    <div className="space-y-5">
      <Field label={prompt('next_action', 'Prochaine action')} required error={errors.next_action}>
        <OptionCards
          shortcuts
          columns={2}
          options={optionsFor('next_action')}
          value={answers.next_action}
          onChange={(v) => setField('next_action', v)}
          reply={reply('next_action')}
        />
      </Field>

      {answers.next_action === 'CALLBACK' && (
        <Input
          type="datetime-local"
          required
          label={prompt('callback_at', 'Date et heure du rappel')}
          value={isoToLocalInput(answers.callback_at)}
          onChange={(e) => setField('callback_at', localInputToIso(e.target.value))}
          error={errors.callback_at}
        />
      )}

      {answers.next_action === 'NRP' && (
        <Alert tone="warning">La communication a été coupée : une tentative NRP sera comptabilisée pour ce lead.</Alert>
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

/** 13. Final internal summary, reviewed before completing the qualification. */
export function SummaryStep({ lead, answers, server, goTo }) {
  return <SummaryView lead={lead} answers={answers} server={server} onEdit={goTo} />
}
