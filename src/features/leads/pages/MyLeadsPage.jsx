import { PageHeader } from '@/components/ui'
import { DispatcherLeadsCard } from '../components/DispatcherLeadsCard'
import { useLeadListState } from '../hooks/useLeadListState'

export default function MyLeadsPage() {
  const state = useLeadListState()

  return (
    <div>
      <PageHeader title="Mes leads" description="Choisissez un lead puis lancez l’appel guidé." />
      <DispatcherLeadsCard state={state} />
    </div>
  )
}
