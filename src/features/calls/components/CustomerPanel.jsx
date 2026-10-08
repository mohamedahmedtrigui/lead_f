import { useState } from 'react'
import { CalendarClock, Copy, Mail, MessageCircle, Phone, PhoneMissed, PhoneOff, ThumbsDown, Ban } from 'lucide-react'
import { toast } from 'sonner'
import { CallOutcomeBadge, LeadStatusBadge } from '@/components/badges'
import { Button, Card } from '@/components/ui'
import { formatDateTime, formatDuration, formatPhone, formatRelative, whatsappLink } from '@/lib/format'
import { CallTimer } from './CallTimer'
import { NotesPanel } from './NotesPanel'
import { OutcomeDialog } from './OutcomeDialog'

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{children || <span className="text-slate-300">—</span>}</span>
    </div>
  )
}

export function CustomerPanel({ lead, timeline, canWork, onOutcome }) {
  const [outcome, setOutcome] = useState(null)
  const callActive = !!lead.open_call

  const copyPhone = async () => {
    await navigator.clipboard?.writeText(lead.phone)
    toast.success('Numéro copié')
  }

  const submitOutcome = async (payload) => {
    await onOutcome(payload)
    setOutcome(null)
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-slate-900" title={lead.name}>
              {lead.name}
            </h2>
            <p className="text-xs text-slate-500">Lead #{lead.id}</p>
          </div>
          <LeadStatusBadge status={lead.status} nrp={lead.nrp} />
        </div>

        {lead.phone ? (
          <div className="mt-4 flex items-center gap-2">
            <a
              href={`tel:${lead.phone}`}
              className="flex flex-1 items-center gap-2 rounded-lg bg-brand-50 px-3 py-2.5 font-mono text-base font-semibold text-brand-700 hover:bg-brand-100"
            >
              <Phone className="size-4" />
              {formatPhone(lead.phone)}
            </a>
            <Button variant="secondary" size="md" icon={Copy} onClick={copyPhone} aria-label="Copier le numéro" />
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Pas de numéro : contacter via {lead.channel ?? 'le canal d’origine'}.
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-2">
          {(lead.whatsapp_number || lead.phone) && (
            <a
              href={whatsappLink(lead.whatsapp_number || lead.phone)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
            >
              <MessageCircle className="size-3.5" /> WhatsApp
            </a>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">
              <Mail className="size-3.5" /> {lead.email}
            </a>
          )}
        </div>

        <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          <InfoRow label="Source">{[lead.source, lead.channel].filter(Boolean).join(' · ')}</InfoRow>
          <InfoRow label="Formulaire">{lead.form}</InfoRow>
          <InfoRow label="Reçu le">{formatDateTime(lead.source_created_at)}</InfoRow>
          <InfoRow label="Dernier contact">{lead.last_contacted_at ? formatRelative(lead.last_contacted_at) : null}</InfoRow>
          <InfoRow label="Tentatives NRP">
            {lead.nrp.attempts} / {lead.nrp.max}
          </InfoRow>
          {lead.callback_at && <InfoRow label="Rappel prévu">{formatDateTime(lead.callback_at)}</InfoRow>}
          {lead.secondary_phone && <InfoRow label="Autre numéro">{formatPhone(lead.secondary_phone)}</InfoRow>}
        </div>
      </Card>

      {canWork && (
        <Card className="p-4">
          {callActive && (
            <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <span className="flex items-center gap-2 font-medium">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                </span>
                Appel en cours
              </span>
              <CallTimer startedAt={lead.open_call.started_at} />
            </div>
          )}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Issue rapide</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" icon={PhoneMissed} className="text-amber-700" onClick={() => setOutcome('NO_ANSWER')} disabled={lead.nrp.final}>
              NRP
            </Button>
            <Button variant="secondary" size="sm" icon={CalendarClock} className="text-violet-700" onClick={() => setOutcome('CALLBACK_REQUESTED')}>
              Rappel
            </Button>
            <Button variant="secondary" size="sm" icon={ThumbsDown} className="text-rose-700" onClick={() => setOutcome('NOT_INTERESTED')}>
              Pas intéressé
            </Button>
            <Button variant="secondary" size="sm" icon={Ban} className="text-zinc-600" onClick={() => setOutcome('INVALID_NUMBER')}>
              N° invalide
            </Button>
          </div>
          {callActive && (
            <Button variant="ghost" size="sm" icon={PhoneOff} className="mt-2 w-full" onClick={() => setOutcome('CONNECTED')}>
              Terminer l’appel sans qualifier
            </Button>
          )}
        </Card>
      )}

      <Card className="p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes internes</p>
        <NotesPanel leadId={lead.id} notes={timeline?.notes ?? []} />
      </Card>

      {timeline?.calls?.length > 0 && (
        <Card className="p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Historique des appels</p>
          <ul className="space-y-2">
            {timeline.calls.map((call) => (
              <li key={call.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-500">
                  #{call.attempt_number} · {formatDateTime(call.started_at)}
                </span>
                <span className="flex items-center gap-2">
                  {call.duration_seconds != null && <span className="font-mono text-slate-400">{formatDuration(call.duration_seconds)}</span>}
                  <CallOutcomeBadge outcome={call.outcome} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {outcome && <OutcomeDialog outcome={outcome} nrp={lead.nrp} onClose={() => setOutcome(null)} onSubmit={submitOutcome} />}
    </div>
  )
}
