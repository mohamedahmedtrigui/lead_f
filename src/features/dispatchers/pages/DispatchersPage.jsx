import { useState } from 'react'
import { Check, Inbox, Pencil, Power, RotateCcw, Trash2, UserPlus, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserStatusBadge } from '@/components/badges'
import { Button, Card, Checkbox, EmptyState, ErrorState, Input, Modal, PageHeader, Select, Spinner } from '@/components/ui'
import { USER_STATUS, toOptions } from '@/constants/domain'
import { formatDateTime } from '@/lib/format'
import { errorMessage, fieldErrors } from '@/lib/http'
import { dispatchersApi } from '../api/dispatchersApi'
import { allocationPayload, describeAllocation, emptyAllocation, LeadAllocationFields } from '../components/LeadAllocationFields'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { DeleteDispatcherDialog } from '../components/DeleteDispatcherDialog'
import { dispatcherKeys, useDispatchers } from '../hooks/useDispatchers'

const emptyForm = { first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '' }

function DispatcherFormDialog({ dispatcher, onClose, onSaved }) {
  const editing = !!dispatcher
  const [form, setForm] = useState(editing ? { ...emptyForm, ...dispatcher, password: '', password_confirmation: '' } : emptyForm)
  const [allocation, setAllocation] = useState(emptyAllocation)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function save() {
    setSaving(true)
    setErrors({})
    const payload = { first_name: form.first_name, last_name: form.last_name, email: form.email, phone: form.phone }
    if (!editing || form.password) Object.assign(payload, { password: form.password, password_confirmation: form.password_confirmation })
    try {
      if (editing) {
        await dispatchersApi.update(dispatcher.id, payload)
        toast.success('Dispatcher mis à jour')
      } else {
        const created = await dispatchersApi.create({ ...payload, ...allocationPayload(allocation) })
        toast.success('Dispatcher créé et activé', { description: describeAllocation(created.allocation) })
      }
      await onSaved()
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
      onClose={onClose}
      title={editing ? `Modifier ${dispatcher.full_name}` : 'Nouveau dispatcher'}
      description={editing ? 'Laissez le mot de passe vide pour le conserver.' : 'Le compte créé par un administrateur est actif immédiatement.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button loading={saving} onClick={save}>
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Prénom" required value={form.first_name} onChange={update('first_name')} error={errors.first_name} />
        <Input label="Nom" required value={form.last_name} onChange={update('last_name')} error={errors.last_name} />
        <Input label="E-mail" type="email" required value={form.email} onChange={update('email')} error={errors.email} className="sm:col-span-2" />
        <Input label="Téléphone" type="tel" value={form.phone ?? ''} onChange={update('phone')} error={errors.phone} className="sm:col-span-2" />
        <Input label="Mot de passe" type="password" required={!editing} value={form.password} onChange={update('password')} error={errors.password} autoComplete="new-password" />
        <Input label="Confirmation" type="password" required={!editing} value={form.password_confirmation} onChange={update('password_confirmation')} autoComplete="new-password" />
        {!editing && (
          <div className="sm:col-span-2">
            <LeadAllocationFields value={allocation} onChange={setAllocation} error={errors.initial_leads} />
          </div>
        )}
      </div>
    </Modal>
  )
}

/** Approve a registration (optional leads) or allocate leads to an active dispatcher. */
function AllocateDialog({ dispatcher, mode, onClose, onDone }) {
  const approving = mode === 'approve'
  const [allocation, setAllocation] = useState(emptyAllocation)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function submit() {
    setSaving(true)
    setError(null)
    try {
      const result = approving
        ? (await dispatchersApi.action(dispatcher.id, 'approve', allocationPayload(allocation))).allocation
        : await dispatchersApi.allocate(dispatcher.id, allocationPayload(allocation))
      toast.success(approving ? 'Compte approuvé' : 'Leads attribués', { description: describeAllocation(result) })
      await onDone()
    } catch (err) {
      setError(fieldErrors(err).initial_leads ?? null)
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={approving ? `Approuver ${dispatcher.full_name}` : `Attribuer des leads à ${dispatcher.full_name}`}
      description={
        approving
          ? 'Le dispatcher pourra se connecter. Vous pouvez lui attribuer des leads immédiatement.'
          : 'Les leads sont choisis automatiquement parmi ceux qui n’ont jamais été traités.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant={approving ? 'success' : 'primary'}
            icon={approving ? Check : Inbox}
            loading={saving}
            disabled={!approving && !(Number(allocation.initial_leads) > 0)}
            onClick={submit}
          >
            {approving ? 'Approuver' : 'Attribuer'}
          </Button>
        </>
      }
    >
      <LeadAllocationFields value={allocation} onChange={setAllocation} error={error} required={!approving} />
    </Modal>
  )
}

function DeactivateDialog({ dispatcher, onClose, onConfirm }) {
  const [release, setRelease] = useState(true)
  const [saving, setSaving] = useState(false)
  return (
    <Modal
      open
      onClose={onClose}
      title={`Désactiver ${dispatcher.full_name} ?`}
      description="Le dispatcher sera déconnecté et ne pourra plus se connecter."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="danger"
            loading={saving}
            onClick={async () => {
              setSaving(true)
              try {
                await onConfirm(release)
              } finally {
                setSaving(false)
              }
            }}
          >
            Désactiver
          </Button>
        </>
      }
    >
      <Checkbox
        label="Libérer ses leads ouverts"
        description={`${dispatcher.open_leads_count ?? 0} lead(s) ouvert(s) retourneront dans le pool non assigné pour redistribution.`}
        checked={release}
        onChange={(e) => setRelease(e.target.checked)}
      />
    </Modal>
  )
}

export default function DispatchersPage() {
  const [status, setStatus] = useState('')
  const query = useDispatchers({ status })
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = create
  const [deactivating, setDeactivating] = useState(null)
  const [allocating, setAllocating] = useState(null) // { dispatcher, mode: 'approve' | 'allocate' }
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(null)

  const refresh = () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: dispatcherKeys.all }), queryClient.invalidateQueries({ queryKey: ['dashboard'] })])

  async function run(user, action, payload, message) {
    setBusy(`${user.id}-${action}`)
    try {
      await dispatchersApi.action(user.id, action, payload)
      toast.success(message)
      await refresh()
      if (action === 'deactivate') queryClient.invalidateQueries({ queryKey: ['leads'] })
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setBusy(null)
    }
  }

  const users = query.data ?? []

  return (
    <div>
      <PageHeader
        title="Dispatchers"
        description="Validez les inscriptions et gérez les comptes."
        actions={
          <Button icon={UserPlus} onClick={() => setEditing(null)}>
            Ajouter un dispatcher
          </Button>
        }
      />

      <Card>
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <Select className="w-52" aria-label="Statut" placeholder="Tous les statuts" options={toOptions(USER_STATUS)} value={status} onChange={(e) => setStatus(e.target.value)} />
          {query.isFetching && <Spinner className="size-4" />}
        </div>

        {query.isError ? (
          <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />
        ) : query.isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="Aucun dispatcher" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Leads ouverts</th>
                  <th className="px-4 py-3">Inscrit le</th>
                  <th className="px-4 py-3">Dernière connexion</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className={u.status === 'PENDING' ? 'bg-amber-50/40' : 'hover:bg-brand-50/40'}>
                    <td className="px-4 py-3 font-medium text-slate-900">{u.full_name}</td>
                    <td className="px-4 py-3">
                      <span className="block text-slate-700">{u.email}</span>
                      <span className="block text-xs text-slate-400">{u.phone}</span>
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {u.open_leads_count ?? 0}
                      <span className="text-xs text-slate-400"> / {u.assigned_leads_count ?? 0}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(u.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(u.last_login_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {u.status === 'PENDING' && (
                          <>
                            <Button size="sm" variant="success" icon={Check} onClick={() => setAllocating({ dispatcher: u, mode: 'approve' })}>
                              Approuver
                            </Button>
                            <Button size="sm" variant="secondary" icon={X} loading={busy === `${u.id}-reject`} onClick={async () => {
                                if (
                                  await confirm({
                                    title: `Refuser l’inscription de ${u.full_name} ?`,
                                    description: 'La personne ne pourra pas se connecter. Vous pourrez réactiver le compte plus tard.',
                                    confirmLabel: 'Refuser',
                                    tone: 'danger',
                                  })
                                )
                                  run(u, 'reject', null, 'Inscription refusée')
                              }}>
                              Refuser
                            </Button>
                          </>
                        )}
                        {u.status === 'APPROVED' && (
                          <Button size="sm" variant="soft" icon={Inbox} onClick={() => setAllocating({ dispatcher: u, mode: 'allocate' })}>
                            Attribuer des leads
                          </Button>
                        )}
                        {u.status === 'APPROVED' && (
                          <Button size="sm" variant="ghost" icon={Power} className="text-rose-600" onClick={() => setDeactivating(u)}>
                            Désactiver
                          </Button>
                        )}
                        {['DEACTIVATED', 'REJECTED'].includes(u.status) && (
                          <Button size="sm" variant="ghost" icon={RotateCcw} loading={busy === `${u.id}-reactivate`} onClick={() => run(u, 'reactivate', null, 'Compte réactivé')}>
                            Activer
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(u)} aria-label={`Modifier ${u.full_name}`} title="Modifier" />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={Trash2}
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => setDeleting(u)}
                          aria-label={`Supprimer ${u.full_name}`}
                          title="Supprimer le compte"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing !== undefined && (
        <DispatcherFormDialog
          dispatcher={editing}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            setEditing(undefined)
            await Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: ['leads'] })])
          }}
        />
      )}
      {deleting && (
        <DeleteDispatcherDialog
          dispatcher={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={async () => {
            setDeleting(null)
            await Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: ['leads'] })])
          }}
        />
      )}
      {allocating && (
        <AllocateDialog
          dispatcher={allocating.dispatcher}
          mode={allocating.mode}
          onClose={() => setAllocating(null)}
          onDone={async () => {
            setAllocating(null)
            await Promise.all([refresh(), queryClient.invalidateQueries({ queryKey: ['leads'] })])
          }}
        />
      )}
      {deactivating && (
        <DeactivateDialog
          dispatcher={deactivating}
          onClose={() => setDeactivating(null)}
          onConfirm={async (release) => {
            await run(deactivating, 'deactivate', { release_leads: release }, 'Compte désactivé')
            setDeactivating(null)
          }}
        />
      )}
    </div>
  )
}
