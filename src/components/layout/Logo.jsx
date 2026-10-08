import { cn } from '@/lib/cn'

export function Logo({ inverted = false, compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-xl text-lg font-black',
          inverted ? 'bg-white text-brand-700' : 'bg-brand-600 text-white',
        )}
      >
        M
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className={cn('block font-bold', inverted ? 'text-white' : 'text-slate-900')}>MiralDrive</span>
          <span className={cn('block text-xs', inverted ? 'text-brand-200' : 'text-slate-500')}>Qualification des leads</span>
        </span>
      )}
    </div>
  )
}
