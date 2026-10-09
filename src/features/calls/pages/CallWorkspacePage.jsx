import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, ChevronRight, Lock, PhoneCall, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { InterestBadge } from '@/components/badges'
import { useConfirm } from '@/components/feedback/ConfirmProvider'
import { Alert, Button, Card, ErrorState, PageLoader } from '@/components/ui'
import { formatNextActions, LEAD_STATUS } from '@/constants/domain'
import { useAuth } from '@/features/auth/context/AuthContext'
import { leadsApi } from '@/features/leads/api/leadsApi'
import { LeadReportButton } from '@/features/leads/components/LeadReportButton'
import { useInvalidateLeads, useLeadQuery, useLeadTimeline } from '@/features/leads/hooks/useLeads'
import { QualificationWizard } from '@/features/qualification/components/QualificationWizard'
import { ScriptBlock } from '@/features/qualification/components/ScriptBlock'
import { SummaryView } from '@/features/qualification/components/SummaryView'
import { useQualificationWizard } from '@/features/qualification/hooks/useQualificationWizard'
import { useScript } from '@/features/script/hooks/useScript'
import { buildScriptContext } from '@/features/qualification/utils/placeholders'
import { errorMessage, fieldErrors } from '@/lib/http'
import { CustomerPanel } from '../components/CustomerPanel'
import { LiveSummaryPanel } from '../components/LiveSummaryPanel'

const CLOSED_STATUSES = ['CONVERTED', 'INVALID', 'NOT_INTERESTED']

/** Center + right columns while a call is in progress (share the wizard state). */
function ActiveCall({ lead, onOutcome, onCompleted }) {
  const wizard = useQualificationWizard({ leadId: lead.id, qualification: lead.qualification })

  const actions = {
    scheduleCallback: (callbackAt, note) => onOutcome({ outcome: 'CALLBACK_REQUESTED', callback_at: callbackAt, note: note || null }),
  }

  return (
    <>
      <section className="min-w-0">
        <QualificationWizard lead={lead} wizard={wizard} actions={actions} onCompleted={onCompleted} />
      </section>
      <aside className="min-w-0">
        <LiveSummaryPanel answers={wizard.answers} server={wizard.server} />
      </aside>
    </>
  )
}

function useNextLead(currentId) {
  const navigate = useNavigate()
  return async () => {
    const page = await leadsApi.list({ status: ['PENDING'], per_page: 5, sort: 'source_created_at', direction: 'desc' })
    const next = page.data.find((lead) => lead.id !== currentId)
    if (next) navigate(`/leads/${next.id}/call`)
    else {
      toast.info('Aucun autre lead à traiter.')
      navigate('/leads')
    }
  }
}

export default function CallWorkspacePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const script = useScript()
  const leadQuery = useLeadQuery(id)
  const timelineQuery = useLeadTimeline(id)
  const invalidate = useInvalidateLeads()
  const [completed, setCompleted] = useState(null)
  const nextLead = useNextLead(Number(id))
  const confirm = useConfirm()

  const startCall = useMutation({
    mutationFn: () => leadsApi.startCall(id),
    onSuccess: () => {
      setCompleted(null)
      return invalidate()
    },
    onError: (error) => toast.error(errorMessage(error)),
  })

  if (leadQuery.isLoading) return <PageLoader />
  if (leadQuery.isError) return <ErrorState description={errorMessage(leadQuery.error)} onRetry={leadQuery.refetch} />

  const lead = leadQuery.data
  const isOwner = user?.id === lead.assigned_to
  const closed = CLOSED_STATUSES.includes(lead.status) || lead.nrp.final
  const canWork = isOwner && !closed
  const callActive = !!lead.open_call

  async function goToNextLead() {
    if (callActive && canWork && !completed) {
      const ok = await confirm({
        title: 'Un appel est en cours',
        description: 'Le brouillon de qualification est enregistré, mais l’appel restera ouvert. Voulez-vous vraiment passer au lead suivant ?',
        confirmLabel: 'Passer au lead suivant',
      })
      if (!ok) return
    }
    nextLead()
  }

  async function handleOutcome(payload) {
    try {
      const updated = await leadsApi.registerOutcome(lead.id, payload)
      await invalidate()
      toast.success(`Lead mis à jour : ${LEAD_STATUS[updated.status]?.label ?? updated.status}`)
    } catch (error) {
      toast.error(errorMessage(error))
      throw Object.assign(error, { fields: fieldErrors(error) })
    }
  }

  async function handleCompleted(response) {
    setCompleted(response)
    toast.success('Qualification terminée')
    await invalidate()
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/leads" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeft className="size-4" /> Mes leads
        </Link>
        <div className="flex items-center gap-2">
          <LeadReportButton lead={lead} variant="ghost" />
          <Button variant="ghost" size="sm" iconRight={ChevronRight} onClick={goToNextLead}>
            Lead suivant
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_320px] 2xl:grid-cols-[340px_minmax(0,1fr)_360px]">
        {/* LEFT: customer information */}
        <aside className="min-w-0 lg:row-span-2 xl:row-span-1">
          <CustomerPanel lead={lead} timeline={timelineQuery.data} canWork={canWork} onOutcome={handleOutcome} />
        </aside>

        {completed ? (
          <>
            <section className="min-w-0">
              <Card className="p-8 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="size-7" />
                </span>
                <h2 className="mt-4 text-xl font-bold text-slate-900">Qualification enregistrée</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {lead.name} · {formatNextActions(completed.qualification)}
                </p>
                <div className="mt-4 flex justify-center">
                  <InterestBadge level={completed.qualification.interest_level} score={completed.qualification.interest_score} />
                </div>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Button as={Link} to="/leads" variant="secondary">
                    Retour à mes leads
                  </Button>
                  <LeadReportButton lead={lead} size="md" />
                  <Button iconRight={ChevronRight} onClick={goToNextLead}>
                    Lead suivant
                  </Button>
                </div>
              </Card>
            </section>
            <aside className="min-w-0">
              <LiveSummaryPanel answers={completed.qualification} server={completed.qualification} />
            </aside>
          </>
        ) : callActive && canWork ? (
          <ActiveCall key={lead.open_call.id} lead={lead} onOutcome={handleOutcome} onCompleted={handleCompleted} />
        ) : (
          <>
            <section className="min-w-0 space-y-4">
              {!isOwner && (
                <Alert tone="warning" icon={Lock}>
                  Ce lead n’est pas assigné à votre compte : consultation uniquement.
                </Alert>
              )}
              {isOwner && closed && (
                <Alert tone="info" icon={Lock} title="Lead clôturé">
                  {lead.nrp.final
                    ? `NRP final atteint (${lead.nrp.attempts}/${lead.nrp.max}).`
                    : `Statut : ${LEAD_STATUS[lead.status].label}.`}{' '}
                  Contactez un administrateur pour le rouvrir.
                </Alert>
              )}

              {canWork && (
                <Card className="p-6">
                  <ScriptBlock step={script.byKey.introduction} context={buildScriptContext({ user, lead })} />
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button size="lg" icon={lead.qualification ? RotateCcw : PhoneCall} loading={startCall.isPending} onClick={() => startCall.mutate()}>
                      {lead.qualification ? 'Nouvel appel / reprendre la qualification' : 'Démarrer l’appel'}
                    </Button>
                    <p className="text-xs text-slate-500">Composez le numéro puis démarrez l’appel : le script guidé s’affiche.</p>
                  </div>
                </Card>
              )}

              {lead.qualification && (
                <Card className="p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {lead.qualification.status === 'COMPLETED' ? 'Dernière qualification' : 'Qualification en cours (brouillon)'}
                  </p>
                  <SummaryView lead={lead} answers={lead.qualification} server={lead.qualification} />
                </Card>
              )}
            </section>
            <aside className="min-w-0">
              {lead.qualification && <LiveSummaryPanel answers={lead.qualification} server={lead.qualification} />}
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
