import { useState } from 'react'
import { Download, Inbox, Shuffle, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button, Card, EmptyState, ErrorState, PageHeader, Pagination, Select, Spinner } from '@/components/ui'
import { INTEREST_LEVEL, toOptions } from '@/constants/domain'
import { useDispatchers } from '@/features/dispatchers/hooks/useDispatchers'
import { saveBlob } from '@/lib/download'
import { errorMessage } from '@/lib/http'
import { leadsApi } from '../api/leadsApi'
import { AssignDialog } from '../components/AssignDialog'
import { DistributeDialog } from '../components/DistributeDialog'
import { LeadFilters } from '../components/LeadFilters'
import { LeadTable } from '../components/LeadTable'
import { useInvalidateLeads, useLeadsQuery } from '../hooks/useLeads'
import { useLeadListState } from '../hooks/useLeadListState'

export default function AdminLeadsPage() {
  const state = useLeadListState()
  const query = useLeadsQuery(state.params)
  const dispatchers = useDispatchers()
  const invalidate = useInvalidateLeads()
  const [selected, setSelected] = useState(() => new Set())
  const [dialog, setDialog] = useState(null)
  const [exporting, setExporting] = useState(false)

  const leads = query.data?.data ?? []

  const toggle = (id) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = (rows, checked) =>
    setSelected((current) => {
      const next = new Set(current)
      rows.forEach((lead) => (checked ? next.add(lead.id) : next.delete(lead.id)))
      return next
    })

  async function assign(payload) {
    try {
      const result = await leadsApi.assign({ ...payload, lead_ids: [...selected] })
      toast.success(`${result.updated} lead(s) mis à jour`)
      setSelected(new Set())
      setDialog(null)
      await invalidate()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  async function distribute(payload) {
    try {
      const result = await leadsApi.distribute({ ...payload, lead_ids: selected.size ? [...selected] : undefined })
      const detail = result.per_dispatcher.map((d) => `${d.full_name} : ${d.received}`).join(' · ')
      toast.success(`${result.distributed} lead(s) distribués`, { description: detail })
      setSelected(new Set())
      setDialog(null)
      await invalidate()
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  async function exportQualified() {
    setExporting(true)
    try {
      const response = await leadsApi.exportQualified({ interest_level: state.extra.interest_level, assigned_to: Number(state.extra.assigned_to) || undefined })
      saveBlob(response.data, 'leads-qualifies.csv', response.headers['content-disposition'])
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setExporting(false)
    }
  }

  const dispatcherOptions = [
    { value: 'none', label: 'Non assignés' },
    ...(dispatchers.data ?? []).map((d) => ({ value: String(d.id), label: d.full_name })),
  ]

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Tous les leads, leur assignation et leur qualification."
        actions={
          <>
            <Button variant="secondary" icon={Download} loading={exporting} onClick={exportQualified}>
              Exporter les qualifiés
            </Button>
            <Button variant="secondary" icon={UserCheck} disabled={!selected.size} onClick={() => setDialog('assign')}>
              Assigner ({selected.size})
            </Button>
            <Button icon={Shuffle} onClick={() => setDialog('distribute')}>
              Distribuer
            </Button>
          </>
        }
      />

      <Card>
        <LeadFilters search={state.search} onSearch={state.setSearch} statuses={state.statuses} onStatuses={state.setStatuses}>
          <Select
            className="w-48"
            aria-label="Dispatcher"
            placeholder="Tous les dispatchers"
            options={dispatcherOptions}
            value={state.extra.assigned_to ?? ''}
            onChange={(e) => state.setExtra({ assigned_to: e.target.value || undefined })}
          />
          <Select
            className="w-44"
            aria-label="Niveau d’intérêt"
            placeholder="Tous les niveaux"
            options={toOptions(INTEREST_LEVEL)}
            value={state.extra.interest_level ?? ''}
            onChange={(e) => state.setExtra({ interest_level: e.target.value || undefined })}
          />
          {query.isFetching && <Spinner className="size-4" />}
        </LeadFilters>

        {query.isError ? (
          <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />
        ) : query.isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState icon={Inbox} title="Aucun lead" description="Importez un fichier CSV ou modifiez les filtres." />
        ) : (
          <LeadTable
            mode="admin"
            leads={leads}
            selected={selected}
            onToggle={toggle}
            onToggleAll={toggleAll}
            sort={state.sort}
            onSort={state.toggleSort}
          />
        )}
        <Pagination meta={query.data?.meta} onPageChange={state.setPage} />
      </Card>

      {dialog === 'assign' && <AssignDialog count={selected.size} onClose={() => setDialog(null)} onSubmit={assign} />}
      {dialog === 'distribute' && <DistributeDialog selectedCount={selected.size} onClose={() => setDialog(null)} onSubmit={distribute} />}
    </div>
  )
}
