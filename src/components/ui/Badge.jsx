import { cn } from '@/lib/cn'

const tones = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  zinc: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
  blue: 'bg-brand-50 text-brand-700 ring-brand-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  green: 'bg-green-50 text-green-700 ring-green-200',
  emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export function Badge({ tone = 'slate', className, children, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone] ?? tones.slate,
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
