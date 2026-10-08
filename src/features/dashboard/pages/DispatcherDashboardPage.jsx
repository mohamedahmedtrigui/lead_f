import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarClock, CheckCircle2, ClipboardList, Flame, Hourglass, PhoneCall, PhoneMissed, ThumbsDown } from 'lucide-react'
import { Card, CardHeader, ErrorState, PageHeader, PageLoader, StatCard } from '@/components/ui'
import { useAuth } from '@/features/auth/context/AuthContext'
import { DispatcherLeadsCard } from '@/features/leads/components/DispatcherLeadsCard'
import { useLeadListState } from '@/features/leads/hooks/useLeadListState'
import { cn } from '@/lib/cn'
import { formatDateTime, formatPhone } from '@/lib/format'
import { errorMessage } from '@/lib/http'
import { dashboardApi } from '../api/dashboardApi'

export default function DispatcherDashboardPage() {
  const { user } = useAuth()
  const query = useQuery({ queryKey: ['dashboard', 'dispatcher'], queryFn: dashboardApi.dispatcher, refetchInterval: 60_000 })
  const listState = useLeadListState()

  if (query.isLoading) return <PageLoader />
  if (query.isError) return <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />

  const { stats, callbacks_due: callbacks } = query.data

  // Tiles double as quick filters for the table below.
  const tiles = [
    { label: 'Leads assignés', value: stats.total, icon: ClipboardList, accent: 'brand', statuses: [] },
    { label: 'À traiter', value: stats.pending, icon: Hourglass, accent: 'slate', statuses: ['PENDING'] },
    { label: 'En cours', value: stats.in_progress, icon: PhoneCall, accent: 'brand', statuses: ['IN_PROGRESS'] },
    { label: 'Rappels', value: stats.callback, icon: CalendarClock, accent: 'violet', statuses: ['CALLBACK'] },
    { label: 'HOT', value: stats.hot, icon: Flame, accent: 'red', level: 'HOT' },
    { label: 'Qualifiés', value: stats.qualified, icon: CheckCircle2, accent: 'green', statuses: ['QUALIFIED'] },
    { label: 'NRP', value: stats.nrp, icon: PhoneMissed, accent: 'amber', statuses: ['NRP'] },
    { label: 'Pas intéressés', value: stats.not_interested, icon: ThumbsDown, accent: 'rose', statuses: ['NOT_INTERESTED'] },
  ]

  const isActive = (tile) =>
    tile.level
      ? listState.extra.interest_level === tile.level
      : !listState.extra.interest_level && tile.statuses.join() === listState.statuses.join()

  const applyTile = (tile) => {
    listState.setStatuses(tile.statuses ?? [])
    listState.setExtra({ interest_level: tile.level })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour ${user?.first_name} 👋`}
        description={`${stats.calls_today} appel(s) aujourd’hui dont ${stats.connected_today} client(s) joint(s).`}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map(({ statuses, level, ...tile }) => (
          <StatCard key={tile.label} {...tile} active={isActive({ statuses, level })} onClick={() => applyTile({ statuses, level })} />
        ))}
      </div>

      {callbacks.length > 0 && (
        <Card>
          <CardHeader icon={CalendarClock} title="Rappels du jour" description="Rappels programmés jusqu’à ce soir." />
          <ul className="divide-y divide-slate-100">
            {callbacks.map((cb) => (
              <li key={cb.id}>
                <Link to={`/leads/${cb.id}/call`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 hover:bg-brand-50/40">
                  <span className="font-medium text-slate-900">{cb.name}</span>
                  <span className="font-mono text-xs text-slate-500">{formatPhone(cb.phone)}</span>
                  <span className={cn('text-sm font-medium', cb.overdue ? 'text-rose-600' : 'text-violet-700')}>
                    {cb.overdue ? 'En retard · ' : ''}
                    {formatDateTime(cb.callback_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <DispatcherLeadsCard state={listState} />
    </div>
  )
}
