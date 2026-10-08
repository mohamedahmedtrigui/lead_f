import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, MessageCircle, Phone, Save, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { LeadStatusBadge } from '@/components/badges'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { Button, Card, CardHeader, Checkbox, EmptyState, ErrorState, Input, PageLoader, Select } from '@/components/ui'
import { LEAD_STATUS, toOptions } from '@/constants/domain'
import { ScoreGauge } from '@/features/qualification/components/ScoreGauge'
import { SummaryView } from '@/features/qualification/components/SummaryView'
import { formatDateTime, formatPhone, whatsappLink } from '@/lib/format'
import { errorMessage } from '@/lib/http'
import { leadsApi } from '../api/leadsApi'
import { AssignDialog } from '../components/AssignDialog'
import { LeadReportButton } from '../components/LeadReportButton'
import { LeadTimeline } from '../components/LeadTimeline'
import { useInvalidateLeads, useLeadQuery, useLeadTimeline } from '../hooks/useLeads'

function StatusForm({ lead, onSaved }) {
  const [status, setStatus] = useState(lead.status)
  const [reason, setReason] = useState('')
  const [resetNrp, setResetNrp] = useState(false)
  const [saving, setSaving] = useState(false)
  const confirm = useConfirm()

  async function save() {
    const changes = [
      status !== lead.status && `Statut : ${LEAD_STATUS[lead.status].label} → ${LEAD_STATUS[status].label}`,
      resetNrp && `Compteur NRP remis à 0 (actuellement ${lead.nrp.attempts} / ${lead.nrp.max})`,
    ].filter(Boolean)
    const ok = await confirm({
      title: `Modifier le lead ${lead.name} ?`,
      description: (
        <ul className="list-disc space-y-1 pl-4">
          {changes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      ),
      confirmLabel: 'Enregistrer',
      tone: ['INVALID', 'NOT_INTERESTED', 'CONVERTED'].includes(status) ? 'danger' : undefined,
    })
    if (!ok) return
    setSaving(true)
    try {
      await leadsApi.updateStatus(lead.id, { status, reason: reason || null, reset_nrp: resetNrp })
      toast.success('Statut mis à jour')
      setReason('')
      setResetNrp(false)
      await onSaved()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <Select label="Statut" options={toOptions(LEAD_STATUS)} value={status} onChange={(e) => setStatus(e.target.value)} />
      <Input label="Motif" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex. : contrat signé" maxLength={255} />
      {lead.nrp.attempts > 0 && (
        <Checkbox
          label="Réinitialiser le compteur NRP"
          description={`${lead.nrp.attempts} / ${lead.nrp.max} tentatives`}
          checked={resetNrp}
          onChange={(e) => setResetNrp(e.target.checked)}
        />
      )}
      <Button icon={Save} loading={saving} disabled={status === lead.status && !resetNrp} onClick={save} className="w-full">
        Enregistrer
      </Button>
    </div>
  )
}

export default function AdminLeadDetailPage() {
  const { id } = useParams()
  const leadQuery = useLeadQuery(id)
  const timelineQuery = useLeadTimeline(id)
  const invalidate = useInvalidateLeads()
  const [assignOpen, setAssignOpen] = useState(false)

  if (leadQuery.isLoading) return <PageLoader />
  if (leadQuery.isError) return <ErrorState description={errorMessage(leadQuery.error)} onRetry={leadQuery.refetch} />

  const lead = leadQuery.data
  const q = lead.qualification

  async function assign(payload) {
    try {
      await leadsApi.assign({ ...payload, lead_ids: [lead.id] })
      toast.success('Assignation mise à jour')
      setAssignOpen(false)
      await invalidate()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <div>
      <Link to="/admin/leads" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="size-4" /> Leads
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
        <LeadStatusBadge status={lead.status} nrp={lead.nrp} />
        <div className="ml-auto">
          <LeadReportButton lead={lead} />
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[320px_minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="space-y-2 text-sm">
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-2 font-mono font-semibold text-brand-700">
                  <Phone className="size-4" /> {formatPhone(lead.phone)}
                </a>
              )}
              {(lead.whatsapp_number || lead.phone) && (
                <a href={whatsappLink(lead.whatsapp_number || lead.phone)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-emerald-700">
                  <MessageCircle className="size-4" /> WhatsApp
                </a>
              )}
              {lead.email && (
                <p className="flex items-center gap-2 text-slate-600">
                  <Mail className="size-4" /> {lead.email}
                </p>
              )}
            </div>
            <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
              {[
                ['Source', lead.source],
                ['Canal', lead.channel],
                ['Formulaire', lead.form],
                ['Étape source', lead.stage],
                ['Reçu le', formatDateTime(lead.source_created_at)],
                ['Dernier contact', formatDateTime(lead.last_contacted_at)],
                ['Rappel', lead.callback_at ? formatDateTime(lead.callback_at) : null],
                ['NRP', `${lead.nrp.attempts} / ${lead.nrp.max}`],
              ].map(([term, value]) => (
                <div key={term} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{term}</dt>
                  <dd className="text-right font-medium text-slate-800">{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Dispatcher</p>
            <p className="font-medium text-slate-900">{lead.assignee?.full_name ?? 'Non assigné'}</p>
            {lead.assigned_at && <p className="text-xs text-slate-500">depuis le {formatDateTime(lead.assigned_at)}</p>}
            <Button variant="secondary" size="sm" icon={UserCheck} className="mt-3 w-full" onClick={() => setAssignOpen(true)}>
              {lead.assignee ? 'Réassigner' : 'Assigner'}
            </Button>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Gestion du statut</p>
            <StatusForm key={lead.status + lead.nrp.attempts} lead={lead} onSaved={invalidate} />
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Qualification"
            description={q ? (q.status === 'COMPLETED' ? `Complétée le ${formatDateTime(q.completed_at)}` : 'Brouillon en cours') : 'Pas encore qualifié'}
          />
          <div className="p-5">
            {q ? (
              <div className="space-y-5">
                <ScoreGauge score={q.interest_score} level={q.interest_level} breakdown={q.score_breakdown} />
                <SummaryView lead={lead} answers={q} server={q} />
              </div>
            ) : (
              <EmptyState title="Aucune qualification" description="Le dispatcher n’a pas encore qualifié ce lead." />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Historique" />
          <LeadTimeline leadId={lead.id} timeline={timelineQuery.data} />
        </Card>
      </div>

      {assignOpen && <AssignDialog count={1} onClose={() => setAssignOpen(false)} onSubmit={assign} />}
    </div>
  )
}
