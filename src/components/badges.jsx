import { Badge } from '@/components/ui'
import { CALL_OUTCOME, INTEREST_LEVEL, LEAD_STATUS, USER_STATUS } from '@/constants/domain'

export function LeadStatusBadge({ status, nrp }) {
  const config = LEAD_STATUS[status] ?? { label: status, tone: 'slate' }
  const label = status === 'NRP' && nrp ? `NRP ${nrp.attempts}/${nrp.max}${nrp.final ? ' · final' : ''}` : config.label
  return (
    <Badge tone={nrp?.final ? 'zinc' : config.tone} dot>
      {label}
    </Badge>
  )
}

export function InterestBadge({ level, score }) {
  if (!level) return <span className="text-xs text-slate-400">—</span>
  const config = INTEREST_LEVEL[level]
  return (
    <Badge tone={config.tone}>
      {config.label}
      {score != null && <span className="tabular-nums opacity-75">· {score}</span>}
    </Badge>
  )
}

export function CallOutcomeBadge({ outcome }) {
  if (!outcome) return <Badge tone="blue">En cours</Badge>
  const config = CALL_OUTCOME[outcome] ?? { label: outcome, tone: 'slate' }
  return <Badge tone={config.tone}>{config.label}</Badge>
}

export function UserStatusBadge({ status }) {
  const config = USER_STATUS[status] ?? { label: status, tone: 'slate' }
  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  )
}
