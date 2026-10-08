import { useState } from 'react'
import { Link } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CallOutcomeBadge } from '@/components/badges'
import { Card, EmptyState, ErrorState, Input, PageHeader, Pagination, Select, Spinner } from '@/components/ui'
import { CALL_OUTCOME, toOptions } from '@/constants/domain'
import { useDispatchers } from '@/features/dispatchers/hooks/useDispatchers'
import { formatDateTime, formatDuration, formatPhone } from '@/lib/format'
import { errorMessage } from '@/lib/http'
import { activityApi } from '../api/activityApi'

export default function CallHistoryPage() {
  const dispatchers = useDispatchers()
  const [filters, setFilters] = useState({ dispatcher_id: '', outcome: '', from: '', to: '', page: 1 })
  const query = useQuery({ queryKey: ['calls', filters], queryFn: () => activityApi.calls(filters), placeholderData: keepPreviousData })
  const set = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value, page: 1 }))
  const calls = query.data?.data ?? []

  return (
    <div>
      <PageHeader title="Historique des appels" description="Toutes les tentatives d’appel de l’équipe." />
      <Card>
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 p-4">
          <Select
            className="w-52"
            label="Dispatcher"
            placeholder="Tous"
            options={(dispatchers.data ?? []).map((d) => ({ value: String(d.id), label: d.full_name }))}
            value={filters.dispatcher_id}
            onChange={set('dispatcher_id')}
          />
          <Select className="w-48" label="Issue" placeholder="Toutes" options={toOptions(CALL_OUTCOME)} value={filters.outcome} onChange={set('outcome')} />
          <Input className="w-44" type="date" label="Du" value={filters.from} onChange={set('from')} />
          <Input className="w-44" type="date" label="Au" value={filters.to} onChange={set('to')} />
          {query.isFetching && <Spinner className="mb-3 size-4" />}
        </div>
        {query.isError ? (
          <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />
        ) : calls.length === 0 && !query.isLoading ? (
          <EmptyState title="Aucun appel" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Dispatcher</th>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3 text-right">Tentative</th>
                  <th className="px-4 py-3">Issue</th>
                  <th className="px-4 py-3 text-right">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-brand-50/40">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(call.started_at)}</td>
                    <td className="px-4 py-3">{call.dispatcher?.full_name}</td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/leads/${call.lead_id}`} className="font-medium text-slate-900 hover:text-brand-700">
                        {call.lead?.name}
                      </Link>
                      <span className="block font-mono text-xs text-slate-400">{formatPhone(call.lead?.phone)}</span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">#{call.attempt_number}</td>
                    <td className="px-4 py-3">
                      <CallOutcomeBadge outcome={call.outcome} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatDuration(call.duration_seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination meta={query.data?.meta} onPageChange={(page) => setFilters((f) => ({ ...f, page }))} />
      </Card>
    </div>
  )
}
