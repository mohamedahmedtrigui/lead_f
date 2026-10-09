import { Building2, Users } from 'lucide-react'
import { Card, Stars } from '@/components/ui'
import { isB2b } from '@/features/qualification/config/steps'
import { ScoreGauge } from '@/features/qualification/components/ScoreGauge'
import { useScript } from '@/features/script/hooks/useScript'

function Fact({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="truncate text-right font-medium text-slate-800" title={typeof value === 'string' ? value : undefined}>
        {value || <span className="font-normal text-slate-300">—</span>}
      </dd>
    </div>
  )
}

/** Right column: live qualification summary and interest score. */
export function LiveSummaryPanel({ answers, server }) {
  const { label } = useScript()
  const b2b = isB2b(answers)
  const route = answers.departure || answers.destination ? `${answers.departure ?? '?'} → ${answers.destination ?? '?'}` : null
  const times = [answers.arrival_time ?? answers.departure_time, answers.trip_type === 'ROUND_TRIP' ? answers.return_time : null].filter(Boolean).join(' / ')
  const extraRoutes = (answers.extra_routes ?? []).length
  const passengers = b2b ? answers.estimated_passengers_per_trip && `${answers.estimated_passengers_per_trip} / trajet` : answers.passengers_count

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <ScoreGauge score={server.interest_score ?? 0} level={server.interest_level ?? 'LOW'} breakdown={server.score_breakdown ?? []} />
        {answers.priority_stars ? (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm text-slate-500">Priorité</span>
            <Stars value={answers.priority_stars} size="sm" />
          </div>
        ) : null}
      </Card>

      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Récapitulatif en direct</p>
          {b2b ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
              <Building2 className="size-3" /> B2B
            </span>
          ) : answers.beneficiary ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              <Users className="size-3" /> B2C
            </span>
          ) : null}
        </div>
        <dl className="divide-y divide-slate-50">
          <Fact label="Pour" value={label('beneficiary', answers.beneficiary)} />
          <Fact label="Besoin" value={label('transport_need', answers.transport_need)} />
          <Fact label="Trajet" value={route} />
          <Fact label="Type" value={label('trip_type', answers.trip_type)} />
          <Fact label="Horaires" value={times} />
          <Fact label="Fréquence" value={label('frequency', answers.frequency)} />
          <Fact label="Jours" value={(answers.days_of_week ?? []).map((d) => label('days_of_week', d)).join(', ')} />
          <Fact label="Passagers" value={passengers} />
          <Fact label="Partage" value={label('shared_transport', answers.shared_transport)} />
          <Fact label="Déjà client" value={label('used_miraldrive', answers.used_miraldrive)} />
          {extraRoutes > 0 && <Fact label="Autres trajets" value={`+ ${extraRoutes}`} />}
          <Fact label="Solution actuelle" value={label('current_provider', answers.current_provider)} />
          {answers.current_provider === 'APPLICATION' && (
            <Fact label="Applications" value={(answers.other_apps ?? []).map((v) => label('other_apps', v)).join(', ')} />
          )}
          <Fact label="Point de douleur" value={answers.pain_point} />
          {b2b && <Fact label="Entreprise" value={answers.company_name} />}
          {b2b && <Fact label="Décision" value={label('decision_role', answers.decision_role)} />}
          <Fact label="Priorité client" value={label('main_priority', answers.main_priority)} />
        </dl>
      </Card>
    </div>
  )
}
