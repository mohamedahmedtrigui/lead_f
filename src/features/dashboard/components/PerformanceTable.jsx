import { UserStatusBadge } from '@/components/badges'
import { EmptyState } from '@/components/ui'
import { formatDuration, percent } from '@/lib/format'

export function PerformanceTable({ rows = [] }) {
  if (!rows.length) return <EmptyState title="Aucun dispatcher actif" description="Approuvez ou créez des dispatchers." />

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 text-left">Dispatcher</th>
            <th className="px-4 py-3">Leads assignés</th>
            <th className="px-4 py-3">Appels</th>
            <th className="px-4 py-3">Joints</th>
            <th className="px-4 py-3">Qualifiés</th>
            <th className="px-4 py-3">HOT</th>
            <th className="px-4 py-3">NRP</th>
            <th className="px-4 py-3">Durée moy.</th>
            <th className="px-4 py-3">Conversion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-right tabular-nums">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-brand-50/40">
              <td className="px-4 py-3 text-left">
                <span className="font-medium text-slate-900">{row.name}</span>
                {row.status !== 'APPROVED' && (
                  <span className="ml-2">
                    <UserStatusBadge status={row.status} />
                  </span>
                )}
              </td>
              <td className="px-4 py-3">{row.assigned}</td>
              <td className="px-4 py-3">{row.calls}</td>
              <td className="px-4 py-3">
                {row.connected} <span className="text-xs text-slate-400">({percent(row.connection_rate)})</span>
              </td>
              <td className="px-4 py-3">
                {row.qualified} <span className="text-xs text-slate-400">({percent(row.qualification_rate)})</span>
              </td>
              <td className="px-4 py-3 font-semibold text-red-600">{row.hot}</td>
              <td className="px-4 py-3">{row.nrp}</td>
              <td className="px-4 py-3 font-mono text-xs">{formatDuration(row.avg_call_seconds)}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">{percent(row.conversion_rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
