import { useState } from 'react'
import { Check, Pencil, Power, RotateCcw, UserPlus, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { UserStatusBadge } from '@/components/badges'
import { Button, Card, Checkbox, EmptyState, ErrorState, Input, Modal, PageHeader, Select, Spinner } from '@/components/ui'
import { USER_STATUS, toOptions } from '@/constants/domain'
import { formatDateTime } from '@/lib/format'
import { errorMessage, fieldErrors } from '@/lib/http'
import { dispatchersApi } from '../api/dispatchersApi'
import { dispatcherKeys, useDispatchers } from '../hooks/useDispatchers'

const emptyForm = { first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '' }

function DispatcherFormDialog({ dispatcher, onClose, onSaved }) {
  const editing = !!dispatcher
  const [form, setForm] = useState(editing ? { ...emptyForm, ...dispatcher, password: '', password_confirmation: '' } : emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function save() {
    setSaving(true)
    setErrors({})
    const payload = { first_name: form.first_name, last_name: form.last_name, email: form.email, phone: form.phone }
    if (!editing || form.password) Object.assign(payload, { password: form.password, password_confirmation: form.password_confirmation })
    try {
      if (editing) await dispatchersApi.update(dispatcher.id, payload)
      else await dispatchersApi.create(payload)
      toast.success(editing ? 'Dispatcher mis à jour' : 'Dispatcher créé et activé')
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
      </div>
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
  const query = useDispatchers(status ? { status } : {})
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = create
  const [deactivating, setDeactivating] = useState(null)
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
                            <Button size="sm" variant="success" icon={Check} loading={busy === `${u.id}-approve`} onClick={() => run(u, 'approve', null, 'Compte approuvé')}>
                              Approuver
                            </Button>
                            <Button size="sm" variant="secondary" icon={X} loading={busy === `${u.id}-reject`} onClick={() => run(u, 'reject', null, 'Inscription refusée')}>
                              Refuser
                            </Button>
                          </>
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
                        <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(u)} aria-label={`Modifier ${u.full_name}`} />
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
            await refresh()
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
