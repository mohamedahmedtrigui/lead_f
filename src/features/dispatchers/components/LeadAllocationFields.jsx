import { useQuery } from '@tanstack/react-query'
import { Inbox } from 'lucide-react'
import { Checkbox, Input } from '@/components/ui'
import { dispatchersApi } from '../api/dispatchersApi'

export const emptyAllocation = { initial_leads: '', allow_rebalance: true }

/** Allocation payload for the API (null when nothing is requested). */
export function allocationPayload(value) {
  const count = Number(value.initial_leads)
  return count > 0 ? { initial_leads: count, allow_rebalance: value.allow_rebalance } : {}
}

/** Human readable result of an allocation returned by the API. */
export function describeAllocation(allocation) {
  if (!allocation) return null
  const parts = [`${allocation.assigned} lead(s) attribué(s)`]
  if (allocation.from_others) parts.push(`dont ${allocation.from_others} repris à d’autres dispatchers`)
  if (allocation.assigned < allocation.requested) parts.push(`(${allocation.requested} demandés : pas assez de leads disponibles)`)
  return parts.join(' ')
}

/**
 * "How many leads should this dispatcher receive?" Only untouched leads
 * (never called, never qualified) are ever allocated.
 */
export function LeadAllocationFields({ value, onChange, error, required = false }) {
  const available = useQuery({ queryKey: ['leads', 'allocatable'], queryFn: dispatchersApi.allocatable })
  const unassigned = available.data?.unassigned ?? 0
  const reassignable = available.data?.reassignable ?? 0
  const max = unassigned + (value.allow_rebalance ? reassignable : 0)

  return (
    <fieldset className="space-y-3 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-800">
        <Inbox className="size-4 text-brand-600" />
        Attribution automatique de leads
      </legend>
      <Input
        type="number"
        min={required ? 1 : 0}
        max={500}
        label="Nombre de leads à attribuer"
        required={required}
        placeholder={required ? 'Ex. : 20' : '0 = aucun'}
        value={value.initial_leads}
        onChange={(e) => onChange({ ...value, initial_leads: e.target.value })}
        error={error}
        hint={
          available.isLoading
            ? 'Calcul des leads disponibles…'
            : `${unassigned} lead(s) non assigné(s) disponible(s) · jusqu’à ${max} au total.`
        }
      />
      <Checkbox
        label="Compléter avec des leads non entamés d’autres dispatchers"
        description={`${reassignable} lead(s) assignés mais jamais appelés. Les leads en cours ou déjà traités ne sont jamais déplacés.`}
        checked={value.allow_rebalance}
        onChange={(e) => onChange({ ...value, allow_rebalance: e.target.checked })}
      />
    </fieldset>
  )
}
