import { Inbox } from 'lucide-react'
import { Card, CardHeader, Checkbox, EmptyState, ErrorState, Pagination, Spinner } from '@/components/ui'
import { errorMessage } from '@/lib/http'
import { useLeadsQuery } from '../hooks/useLeads'
import { LeadFilters } from './LeadFilters'
import { LeadTable } from './LeadTable'

/** Assigned leads table of the dispatcher (dashboard + "Mes leads"). */
export function DispatcherLeadsCard({ state, title = 'Mes leads assignés' }) {
  const query = useLeadsQuery(state.params)
  const leads = query.data?.data ?? []

  return (
    <Card>
      <CardHeader
        title={title}
        description="Seuls les leads qui vous sont assignés sont visibles."
        actions={query.isFetching && <Spinner className="size-4" />}
      />
      <LeadFilters search={state.search} onSearch={state.setSearch} statuses={state.statuses} onStatuses={state.setStatuses}>
        <Checkbox
          label="Rappels du jour"
          checked={!!state.extra.callback_due}
          onChange={(e) => state.setExtra({ callback_due: e.target.checked ? 1 : undefined })}
        />
      </LeadFilters>
      {query.isError ? (
        <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />
      ) : query.isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : leads.length === 0 ? (
        <EmptyState icon={Inbox} title="Aucun lead" description="Aucun lead ne correspond à ces critères." />
      ) : (
        <LeadTable leads={leads} sort={state.sort} onSort={state.toggleSort} />
      )}
      <Pagination meta={query.data?.meta} onPageChange={state.setPage} />
    </Card>
  )
}
