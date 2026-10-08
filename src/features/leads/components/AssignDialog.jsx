import { useState } from 'react'
import { UserCheck } from 'lucide-react'
import { Button, Input, Modal, Select } from '@/components/ui'
import { useActiveDispatchers } from '@/features/dispatchers/hooks/useDispatchers'

/** Manual (re)assignment of one or several leads. */
export function AssignDialog({ count, onClose, onSubmit }) {
  const dispatchers = useActiveDispatchers()
  const [dispatcherId, setDispatcherId] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const options = [
    { value: 'none', label: '— Retirer l’assignation —' },
    ...(dispatchers.data ?? []).map((d) => ({ value: String(d.id), label: `${d.full_name} (${d.open_leads_count ?? 0} leads ouverts)` })),
  ]

  async function submit() {
    setSubmitting(true)
    try {
      await onSubmit({ dispatcher_id: dispatcherId === 'none' ? null : Number(dispatcherId), reason: reason || null })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Assigner ${count} lead${count > 1 ? 's' : ''}`}
      description="L’historique d’assignation est conservé."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button icon={UserCheck} disabled={!dispatcherId} loading={submitting} onClick={submit}>
            Assigner
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select label="Dispatcher" placeholder="Choisir un dispatcher…" options={options} value={dispatcherId} onChange={(e) => setDispatcherId(e.target.value)} />
        <Input label="Motif (optionnel)" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={255} />
      </div>
    </Modal>
  )
}
