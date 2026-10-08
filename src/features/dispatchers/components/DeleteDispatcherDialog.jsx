import { useState } from 'react'
import { Archive, ShieldCheck, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, Button, Input, Modal, Select } from '@/components/ui'
import { errorMessage, fieldErrors } from '@/lib/http'
import { cn } from '@/lib/cn'
import { dispatchersApi } from '../api/dispatchersApi'
import { useActiveDispatchers } from '../hooks/useDispatchers'

const OPEN_LEAD_CHOICES = [
  { value: 'redistribute', title: 'Redistribuer', description: 'Round-robin entre les autres dispatchers actifs.' },
  { value: 'release', title: 'Remettre dans le pool', description: 'Non assignés, à distribuer plus tard.' },
]

/**
 * Safe deletion: the account is archived, its work is never lost. The admin
 * decides what happens to open and processed leads, then types SUPPRIMER.
 */
export function DeleteDispatcherDialog({ dispatcher, onClose, onDeleted }) {
  const others = (useActiveDispatchers().data ?? []).filter((d) => d.id !== dispatcher.id)
  const [openLeads, setOpenLeads] = useState(others.length ? 'redistribute' : 'release')
  const [transferTo, setTransferTo] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const open = dispatcher.open_leads_count ?? 0
  const processed = Math.max(0, (dispatcher.assigned_leads_count ?? 0) - open)

  async function submit() {
    setSaving(true)
    setErrors({})
    try {
      const result = await dispatchersApi.remove(dispatcher.id, {
        open_leads: openLeads,
        transfer_processed_to: transferTo ? Number(transferTo) : null,
        confirmation: confirmation.trim().toUpperCase(),
      })
      const parts = [
        result.redistributed && `${result.redistributed} lead(s) redistribué(s)`,
        result.released && `${result.released} remis dans le pool`,
        result.processed_transferred && `${result.processed_transferred} lead(s) traité(s) transféré(s)`,
      ].filter(Boolean)
      toast.success(`Compte de ${dispatcher.full_name} supprimé (archivé)`, { description: parts.join(' · ') || undefined })
      await onDeleted()
    } catch (error) {
      setErrors(fieldErrors(error))
      toast.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={`Supprimer le compte de ${dispatcher.full_name}`}
      description="Le compte est archivé : la personne ne peut plus se connecter, mais rien de son travail n’est perdu."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="danger" icon={Trash2} loading={saving} disabled={confirmation.trim().toUpperCase() !== 'SUPPRIMER'} onClick={submit}>
            Supprimer le compte
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Alert tone="info" icon={ShieldCheck} title="Conservé">
          Appels, notes, qualifications, fiches PDF et statistiques restent attribués à « {dispatcher.full_name} (supprimé) ».
        </Alert>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-800">
            {open} lead(s) ouvert(s) <span className="font-normal text-slate-500">(à traiter, en cours, rappel, NRP)</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {OPEN_LEAD_CHOICES.map((choice) => {
              const disabled = choice.value === 'redistribute' && others.length === 0
              return (
                <button
                  key={choice.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => setOpenLeads(choice.value)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50',
                    openLeads === choice.value ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-300',
                  )}
                >
                  <p className="font-semibold text-slate-900">{choice.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{disabled ? 'Aucun autre dispatcher actif.' : choice.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        <Select
          label={`${processed} lead(s) déjà traité(s)`}
          hint="Par défaut, ils restent attribués au compte archivé (historique intact)."
          placeholder="Les garder sur le compte archivé"
          options={others.map((d) => ({ value: String(d.id), label: `Transférer à ${d.full_name}` }))}
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
          error={errors.transfer_processed_to}
        />

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <Input
            label="Tapez SUPPRIMER pour confirmer"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            error={errors.confirmation}
            autoComplete="off"
          />
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Archive className="size-3.5" /> L’adresse e-mail sera libérée et pourra être réutilisée.
          </p>
        </div>
      </div>
    </Modal>
  )
}
