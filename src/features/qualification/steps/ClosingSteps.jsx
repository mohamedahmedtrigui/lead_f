import { Wand2 } from 'lucide-react'
import { Alert, Button, Checkbox, Field, Input, Stars, Textarea } from '@/components/ui'
import { isoToLocalInput, localInputToIso } from '@/lib/format'
import { OptionCards } from '../components/OptionCards'
import { ScoreGauge } from '../components/ScoreGauge'
import { SummaryView } from '../components/SummaryView'
import { buildSummaryDraft } from '../utils/summary'

/** LEVEL 12 — Qualification: computed score + dispatcher priority. */
export function QualificationStep({ answers, setField, errors, prompt, server }) {
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
    </div>
  )
}

/** Closing: internal summary note + mandatory next action. */
export function ClosingStep({ answers, setField, errors, optionsFor, prompt, label }) {
  return (
    <div className="space-y-5">
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

      <Field label={prompt('next_action', 'Prochaine action')} required error={errors.next_action}>
        <OptionCards shortcuts columns={2} options={optionsFor('next_action')} value={answers.next_action} onChange={(v) => setField('next_action', v)} />
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
    </div>
  )
}

/** Final summary, reviewed before completing the qualification. */
export function SummaryStep({ lead, answers, server, goTo }) {
  return <SummaryView lead={lead} answers={answers} server={server} onEdit={goTo} />
}
