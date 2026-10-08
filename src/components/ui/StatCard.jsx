import { cn } from '@/lib/cn'

const accents = {
  brand: 'bg-brand-50 text-brand-600',
  slate: 'bg-slate-100 text-slate-600',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
  emerald: 'bg-emerald-50 text-emerald-600',
}

export function StatCard({ label, value, icon: Icon, accent = 'brand', hint, onClick, active = false }) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition',
        active ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200',
        onClick && 'hover:border-brand-300 hover:shadow',
      )}
    >
      {Icon && (
        <span className={cn('rounded-lg p-2.5', accents[accent])}>
          <Icon className="size-5" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <span className="block text-2xl font-bold tabular-nums text-slate-900">{value ?? '—'}</span>
        {hint && <span className="block truncate text-xs text-slate-500">{hint}</span>}
      </span>
    </Component>
  )
}
