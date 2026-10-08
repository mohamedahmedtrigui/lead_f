import { useState } from 'react'
import { CallOutcomeBadge } from '@/components/badges'
import { AUDIT_EVENT, CALL_OUTCOME, LEAD_STATUS, NEXT_ACTION } from '@/constants/domain'
import { NotesPanel } from '@/features/calls/components/NotesPanel'
import { cn } from '@/lib/cn'
import { formatDateTime, formatDuration } from '@/lib/format'

const TABS = [
  { key: 'events', label: 'Activité' },
  { key: 'calls', label: 'Appels' },
  { key: 'notes', label: 'Notes' },
  { key: 'assignments', label: 'Assignations' },
]

function describeEvent(event) {
  const p = event.properties ?? {}
  const status = (code) => LEAD_STATUS[code]?.label ?? code
  const reason = (text) => (text ?? '').replace(/[A-Z_]{4,}/g, (code) => NEXT_ACTION[code] ?? code)
  switch (event.event) {
    case 'STATUS_CHANGED':
      return `${p.from ? status(p.from) : '—'} → ${status(p.to)}${p.reason ? ` (${reason(p.reason)})` : ''}`
    case 'SCORE_CHANGED':
      return `${p.from} → ${p.to} (${p.level})`
    case 'LEAD_ASSIGNED':
    case 'LEAD_REASSIGNED':
      return p.to_name ? `à ${p.to_name}${p.reason ? ` · ${p.reason}` : ''}` : null
    case 'NRP_REGISTERED':
      return `Tentative ${p.attempt}/${p.max}${p.final ? ' · NRP final' : ''}`
    case 'CALLBACK_SCHEDULED':
      return formatDateTime(p.callback_at)
    case 'QUALIFICATION_COMPLETED':
      return `Score ${p.score} · ${p.level} · ${NEXT_ACTION[p.next_action] ?? p.next_action}`
    case 'NOTE_ADDED':
      return p.excerpt
    case 'CALL_ENDED':
      return `${CALL_OUTCOME[p.outcome]?.label ?? p.outcome}${p.duration != null ? ` · ${formatDuration(p.duration)}` : ''}`
    default:
      return null
  }
}

export function LeadTimeline({ leadId, timeline }) {
  const [tab, setTab] = useState('events')
  const data = timeline ?? { events: [], calls: [], notes: [], assignments: [] }

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-100 px-4" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2.5 text-sm font-medium',
              tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700',
            )}
          >
            {t.label}
            <span className="ml-1 text-xs text-slate-400">{data[t.key]?.length ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="max-h-[560px] overflow-y-auto p-4">
        {tab === 'events' && (
          <ol className="relative space-y-4 border-l border-slate-200 pl-4">
            {data.events.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-white bg-brand-500" />
                <p className="text-sm font-medium text-slate-800">{AUDIT_EVENT[event.event] ?? event.event}</p>
                {describeEvent(event) && <p className="text-sm text-slate-600">{describeEvent(event)}</p>}
                <p className="text-xs text-slate-400">
                  {formatDateTime(event.created_at)} · {event.user?.full_name ?? 'Système'}
                </p>
              </li>
            ))}
            {data.events.length === 0 && <li className="text-sm text-slate-400">Aucune activité.</li>}
          </ol>
        )}

        {tab === 'calls' && (
          <ul className="divide-y divide-slate-100">
            {data.calls.map((call) => (
              <li key={call.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <span className="font-medium">#{call.attempt_number}</span> · {formatDateTime(call.started_at)} · {call.dispatcher?.full_name}
                </span>
                <span className="flex items-center gap-2">
                  {call.duration_seconds != null && <span className="font-mono text-xs text-slate-400">{formatDuration(call.duration_seconds)}</span>}
                  <CallOutcomeBadge outcome={call.outcome} />
                </span>
              </li>
            ))}
            {data.calls.length === 0 && <li className="text-sm text-slate-400">Aucun appel.</li>}
          </ul>
        )}

        {tab === 'notes' && <NotesPanel leadId={leadId} notes={data.notes} />}

        {tab === 'assignments' && (
          <ul className="divide-y divide-slate-100">
            {data.assignments.map((a) => (
              <li key={a.id} className="py-2 text-sm">
                <p>
                  {a.from?.full_name ?? 'Non assigné'} → <span className="font-medium">{a.to?.full_name ?? 'Non assigné'}</span>{' '}
                  <span className="text-xs text-slate-400">({a.type})</span>
                </p>
                <p className="text-xs text-slate-400">
                  {formatDateTime(a.created_at)} · par {a.by?.full_name ?? 'Système'}
                  {a.reason ? ` · ${a.reason}` : ''}
                </p>
              </li>
            ))}
            {data.assignments.length === 0 && <li className="text-sm text-slate-400">Aucune assignation.</li>}
          </ul>
        )}
      </div>
    </div>
  )
}
