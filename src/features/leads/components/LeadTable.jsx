import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronRight, PhoneCall } from 'lucide-react'
import { InterestBadge, LeadStatusBadge } from '@/components/badges'
import { Button, Stars } from '@/components/ui'
import { NEXT_ACTION } from '@/constants/domain'
import { useScript } from '@/features/script/hooks/useScript'
import { cn } from '@/lib/cn'
import { formatDateTime, formatPhone, formatRelative } from '@/lib/format'

function SortHeader({ field, sort, onSort, children, className }) {
  if (!onSort) return <th className={cn('px-4 py-3', className)}>{children}</th>
  const active = sort?.field === field
  const Icon = sort?.direction === 'asc' ? ArrowUp : ArrowDown
  return (
    <th className={cn('px-4 py-3', className)}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cn('inline-flex items-center gap-1 uppercase hover:text-slate-700', active && 'text-brand-700')}
      >
        {children}
        {active && <Icon className="size-3" />}
      </button>
    </th>
  )
}

/**
 * Lead table. mode = "dispatcher" (call action) or "admin" (selection,
 * dispatcher column, detail link).
 */
export function LeadTable({ leads, mode = 'dispatcher', selected, onToggle, onToggleAll, sort, onSort }) {
  const { label } = useScript()
  const admin = mode === 'admin'
  const allSelected = admin && leads.length > 0 && leads.every((lead) => selected?.has(lead.id))

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            {admin && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Tout sélectionner"
                  className="size-4 accent-brand-600"
                  checked={allSelected}
                  onChange={() => onToggleAll(leads, !allSelected)}
                />
              </th>
            )}
            <SortHeader field="name" sort={sort} onSort={onSort}>
              Nom
            </SortHeader>
            <th className="px-4 py-3">Téléphone</th>
            {admin && <th className="px-4 py-3">Dispatcher</th>}
            <th className="px-4 py-3">Type</th>
            <SortHeader field="priority" sort={sort} onSort={onSort}>
              Statut
            </SortHeader>
            <SortHeader field="interest_score" sort={sort} onSort={onSort}>
              Intérêt
            </SortHeader>
            <SortHeader field="priority_stars" sort={sort} onSort={onSort}>
              Priorité
            </SortHeader>
            <SortHeader field="last_contacted_at" sort={sort} onSort={onSort}>
              Dernier contact
            </SortHeader>
            <th className="px-4 py-3">Prochaine action</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead) => {
            const q = lead.qualification
            const href = admin ? `/admin/leads/${lead.id}` : `/leads/${lead.id}/call`
            return (
              <tr key={lead.id} className={cn('transition-colors hover:bg-brand-50/40', selected?.has(lead.id) && 'bg-brand-50/60')}>
                {admin && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Sélectionner ${lead.name}`}
                      className="size-4 accent-brand-600"
                      checked={selected?.has(lead.id) ?? false}
                      onChange={() => onToggle(lead.id)}
                    />
                  </td>
                )}
                <td className="max-w-56 px-4 py-3">
                  <Link to={href} className="block truncate font-medium text-slate-900 hover:text-brand-700" title={lead.name}>
                    {lead.name}
                  </Link>
                  <span className="text-xs text-slate-400">{lead.channel ?? lead.source}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">{formatPhone(lead.phone)}</td>
                {admin && (
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {lead.assignee?.full_name ?? <span className="text-xs italic text-slate-400">Non assigné</span>}
                  </td>
                )}
                <td className="max-w-40 truncate px-4 py-3 text-slate-600">{label('transport_need', q?.transport_need) ?? '—'}</td>
                <td className="px-4 py-3">
                  <LeadStatusBadge status={lead.status} nrp={lead.nrp} />
                </td>
                <td className="px-4 py-3">
                  <InterestBadge level={q?.interest_level} score={q?.interest_score} />
                </td>
                <td className="px-4 py-3">{q?.priority_stars ? <Stars value={q.priority_stars} size="sm" /> : <span className="text-slate-300">—</span>}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500" title={formatDateTime(lead.last_contacted_at)}>
                  {lead.last_contacted_at ? formatRelative(lead.last_contacted_at) : '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {lead.status === 'CALLBACK' && lead.callback_at ? (
                    <span className={cn('text-xs font-medium', new Date(lead.callback_at) < new Date() ? 'text-rose-600' : 'text-violet-700')}>
                      Rappel {formatDateTime(lead.callback_at)}
                    </span>
                  ) : (
                    (NEXT_ACTION[q?.next_action] ?? '—')
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {admin ? (
                    <Button as={Link} to={href} variant="ghost" size="sm" iconRight={ChevronRight}>
                      Détail
                    </Button>
                  ) : (
                    <Button as={Link} to={href} variant="soft" size="sm" icon={PhoneCall}>
                      Appeler
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
