import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  CheckCircle2,
  ClipboardList,
  Flame,
  Hourglass,
  PhoneCall,
  PhoneMissed,
  Sun,
  ThumbsDown,
  Trophy,
  UserCheck,
} from 'lucide-react'
import { Alert, Card, CardHeader, ErrorState, PageHeader, PageLoader, StatCard } from '@/components/ui'
import { LEAD_STATUS } from '@/constants/domain'
import { errorMessage } from '@/lib/http'
import { dashboardApi } from '../api/dashboardApi'
import { DistributionBars } from '../components/DistributionBars'
import { FunnelChart } from '../components/FunnelChart'
import { PerformanceTable } from '../components/PerformanceTable'

export default function AdminDashboardPage() {
  const query = useQuery({ queryKey: ['dashboard', 'admin'], queryFn: dashboardApi.admin, refetchInterval: 60_000 })

  if (query.isLoading) return <PageLoader />
  if (query.isError) return <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />

  const { stats, funnel, performance, by_status: byStatus, pending_dispatchers: pendingDispatchers, today } = query.data

  const tiles = [
    { label: 'Total leads', value: stats.total, icon: ClipboardList, accent: 'brand' },
    { label: 'Assignés', value: stats.assigned, icon: UserCheck, accent: 'brand', hint: `${stats.unassigned} non assignés` },
    { label: 'À traiter', value: stats.pending, icon: Hourglass, accent: 'slate' },
    { label: 'Contactés', value: stats.contacted, icon: PhoneCall, accent: 'violet', hint: `${today.calls} appels aujourd’hui` },
    { label: 'Qualifiés', value: stats.qualified, icon: CheckCircle2, accent: 'green' },
    { label: 'HOT', value: stats.hot, icon: Flame, accent: 'red' },
    { label: 'WARM', value: stats.warm, icon: Sun, accent: 'orange' },
    { label: 'NRP', value: stats.nrp, icon: PhoneMissed, accent: 'amber' },
    { label: 'Pas intéressés', value: stats.not_interested, icon: ThumbsDown, accent: 'rose' },
    { label: 'Convertis', value: stats.converted, icon: Trophy, accent: 'emerald' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord" description="Vue d’ensemble de la qualification des leads." />

      {pendingDispatchers > 0 && (
        <Alert tone="info" title={`${pendingDispatchers} inscription(s) en attente de validation`}>
          <Link to="/admin/dispatchers" className="font-semibold underline">
            Gérer les dispatchers
          </Link>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map((tile) => (
          <StatCard key={tile.label} {...tile} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader title="Entonnoir de conversion" description="Leads → Contactés → Conversations → Qualifiés → HOT → Devis → Convertis" />
          <div className="p-5">
            <FunnelChart steps={funnel} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Répartition par statut" />
          <div className="p-5">
            <DistributionBars
              items={Object.entries(LEAD_STATUS).map(([key, { label }]) => ({ key, label, count: byStatus[key] ?? 0 }))}
            />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Performance des dispatchers" description="Joints = client joint (connecté, rappel demandé ou refus). Conversion = convertis / assignés." />
        <PerformanceTable rows={performance} />
      </Card>
    </div>
  )
}
