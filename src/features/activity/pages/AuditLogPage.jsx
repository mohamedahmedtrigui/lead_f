import { useState } from 'react'
import { Link } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Card, EmptyState, ErrorState, PageHeader, Pagination, Select, Spinner } from '@/components/ui'
import { AUDIT_EVENT, toOptions } from '@/constants/domain'
import { formatDateTime } from '@/lib/format'
import { errorMessage } from '@/lib/http'
import { activityApi } from '../api/activityApi'

const formatProperties = (properties) =>
  Object.entries(properties ?? {})
    .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join(' · ')

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ event: '', page: 1 })
  const query = useQuery({ queryKey: ['audit', filters], queryFn: () => activityApi.audit(filters), placeholderData: keepPreviousData })
  const logs = query.data?.data ?? []

  return (
    <div>
      <PageHeader title="Journal d’audit" description="Assignations, appels, qualifications, changements de statut et de score." />
      <Card>
        <div className="flex items-end gap-3 border-b border-slate-100 p-4">
          <Select
            className="w-64"
            label="Événement"
            placeholder="Tous les événements"
            options={toOptions(AUDIT_EVENT)}
            value={filters.event}
            onChange={(e) => setFilters({ event: e.target.value, page: 1 })}
          />
          {query.isFetching && <Spinner className="mb-3 size-4" />}
        </div>
        {query.isError ? (
          <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />
        ) : logs.length === 0 && !query.isLoading ? (
          <EmptyState title="Aucun événement" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Utilisateur</th>
                  <th className="px-4 py-3">Événement</th>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="align-top hover:bg-brand-50/40">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(log.created_at)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{log.user?.full_name ?? 'Système'}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium">{AUDIT_EVENT[log.event] ?? log.event}</td>
                    <td className="px-4 py-3">
                      {log.lead ? (
                        <Link to={`/admin/leads/${log.lead.id}`} className="text-brand-700 hover:underline">
                          {log.lead.name}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="max-w-md px-4 py-3 text-xs text-slate-500">{formatProperties(log.properties)}</td>
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
