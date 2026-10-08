import { Search, X } from 'lucide-react'
import { LEAD_STATUS } from '@/constants/domain'
import { cn } from '@/lib/cn'

/** Search box + status chips (+ optional extra filters). */
export function LeadFilters({ search, onSearch, statuses = [], onStatuses, children }) {
  const toggleStatus = (status) =>
    onStatuses(statuses.includes(status) ? statuses.filter((s) => s !== status) : [...statuses, status])

  return (
    <div className="space-y-3 border-b border-slate-100 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Rechercher un nom, un téléphone, un e-mail…"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        {children}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {Object.entries(LEAD_STATUS).map(([value, { label }]) => {
          const active = statuses.includes(value)
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggleStatus(value)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300',
              )}
            >
              {label}
            </button>
          )
        })}
        {statuses.length > 0 && (
          <button type="button" onClick={() => onStatuses([])} className="ml-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
            <X className="size-3" /> Effacer
          </button>
        )}
      </div>
    </div>
  )
}
