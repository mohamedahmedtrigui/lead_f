import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Button, Input, Textarea } from '@/components/ui'
import { localInputToIso } from '@/lib/format'
import { OptionCards } from '../components/OptionCards'

/** 1. Introduction: permission to talk for ~5 minutes. */
export function IntroductionStep({ answers, setField, errors, optionsFor, reply, actions }) {
  const [callbackAt, setCallbackAt] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function schedule() {
    setSubmitting(true)
    try {
      await actions.scheduleCallback(localInputToIso(callbackAt), note)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <OptionCards
        shortcuts
        options={optionsFor('call_availability')}
        value={answers.call_availability}
        onChange={(v) => setField('call_availability', v)}
        error={answers.call_availability !== 'CALLBACK' ? errors.call_availability : null}
        reply={reply('call_availability')}
      />

      {answers.call_availability === 'CALLBACK' && (
        <div className="space-y-3 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-violet-800">
            <CalendarClock className="size-4" />
            Notez le créneau proposé par le client
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Date et heure du rappel"
              type="datetime-local"
              required
              value={callbackAt}
              onChange={(e) => setCallbackAt(e.target.value)}
            />
            <Input label="Note (optionnel)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. : préfère après 18h" />
          </div>
          <Button variant="primary" className="bg-violet-600 hover:bg-violet-700" icon={CalendarClock} disabled={!callbackAt} loading={submitting} onClick={schedule}>
            Programmer le rappel et terminer l’appel
          </Button>
        </div>
      )}
    </div>
  )
}

/** 2. Who needs the transport. */
export function BeneficiaryStep({ answers, setField, errors, optionsFor, reply }) {
  const choose = (value) => {
    setField('beneficiary', value)
    // "Pour lui-même" = B2C personal trip: level 3 is skipped.
    if (value === 'SELF') setField('transport_need', 'PERSONAL')
    else if (answers.transport_need === 'PERSONAL') setField('transport_need', null)
  }

  return (
    <div className="space-y-4">
      <OptionCards
        shortcuts
        columns={2}
        options={optionsFor('beneficiary')}
        value={answers.beneficiary}
        onChange={choose}
        error={errors.beneficiary}
        reply={reply('beneficiary')}
      />
      {answers.beneficiary === 'SELF' && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Besoin <strong>B2C</strong> : on passe directement au trajet.
        </p>
      )}
    </div>
  )
}

/** 3. For whom exactly (only for "Autre personne"): family, employees (B2B)… */
export function NeedStep({ answers, setField, errors, optionsFor, prompt, reply }) {
  return (
    <div className="space-y-4">
      <OptionCards
        shortcuts
        columns={2}
        options={optionsFor('transport_need').filter((option) => option.value !== 'PERSONAL')}
        value={answers.transport_need}
        onChange={(v) => setField('transport_need', v)}
        error={errors.transport_need}
        reply={reply('transport_need')}
      />
      <Textarea
        rows={2}
        label={prompt('transport_need_details', 'Précisions sur le besoin')}
        value={answers.transport_need_details ?? ''}
        onChange={(e) => setField('transport_need_details', e.target.value)}
        maxLength={255}
      />
    </div>
  )
}
