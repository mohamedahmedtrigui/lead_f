import { useState } from 'react'
import { Button, Input, Modal, Textarea } from '@/components/ui'
import { localInputToIso } from '@/lib/format'

const CONFIG = {
  NO_ANSWER: {
    title: 'Pas de réponse (NRP)',
    description: 'Une tentative NRP sera comptabilisée.',
    confirm: 'Enregistrer le NRP',
    variant: 'warning',
    noteRequired: false,
  },
  CALLBACK_REQUESTED: {
    title: 'Programmer un rappel',
    description: 'Le lead passera en statut « Rappel ».',
    confirm: 'Programmer le rappel',
    variant: 'primary',
    noteRequired: false,
    date: true,
  },
  NOT_INTERESTED: {
    title: 'Client pas intéressé',
    description: 'Le lead sera clôturé. Indiquez la raison.',
    confirm: 'Clôturer le lead',
    variant: 'danger',
    noteRequired: true,
  },
  INVALID_NUMBER: {
    title: 'Numéro invalide',
    description: 'Le lead sera marqué invalide.',
    confirm: 'Marquer invalide',
    variant: 'danger',
    noteRequired: true,
  },
  CONNECTED: {
    title: 'Terminer l’appel',
    description: 'L’appel est clôturé sans compléter la qualification. Le brouillon est conservé.',
    confirm: 'Terminer l’appel',
    variant: 'primary',
    noteRequired: false,
  },
}

export function OutcomeDialog({ outcome, onClose, onSubmit, nrp }) {
  const config = CONFIG[outcome]
  const [note, setNote] = useState('')
  const [callbackAt, setCallbackAt] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  if (!config) return null

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await onSubmit({
        outcome,
        note: note.trim() || null,
        callback_at: config.date ? localInputToIso(callbackAt) : undefined,
      })
    } catch (error) {
      setErrors(error.fields ?? {})
    } finally {
      setSubmitting(false)
    }
  }

  const description =
    outcome === 'NO_ANSWER' && nrp ? `Tentative ${nrp.attempts + 1} / ${nrp.max}. ${nrp.attempts + 1 >= nrp.max ? 'Ce sera le NRP final.' : ''}` : config.description

  return (
    <Modal
      open
      onClose={onClose}
      title={config.title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant={config.variant}
            loading={submitting}
            disabled={(config.noteRequired && !note.trim()) || (config.date && !callbackAt)}
            onClick={submit}
          >
            {config.confirm}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {config.date && (
          <Input
            type="datetime-local"
            label="Date et heure du rappel"
            required
            value={callbackAt}
            onChange={(e) => setCallbackAt(e.target.value)}
            error={errors.callback_at}
          />
        )}
        <Textarea
          label={config.noteRequired ? 'Raison' : 'Note (optionnel)'}
          required={config.noteRequired}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          error={errors.note}
          maxLength={2000}
        />
      </form>
    </Modal>
  )
}
