import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from './Button'

export function Spinner({ className }) {
  return <Loader2 className={cn('size-5 animate-spin text-brand-600', className)} />
}

export function PageLoader({ label = 'Chargement…' }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm text-slate-500">
      <Spinner className="size-7" />
      {label}
    </div>
  )
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      <span className="mb-3 rounded-full bg-brand-50 p-3 text-brand-500">
        <Icon className="size-6" />
      </span>
      <p className="font-medium text-slate-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ title = 'Impossible de charger les données', description, onRetry }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title={title}
      description={description}
      action={onRetry && <Button variant="secondary" onClick={onRetry}>Réessayer</Button>}
    />
  )
}

export function Alert({ tone = 'info', title, children, className, icon: Icon = AlertTriangle }) {
  const tones = {
    info: 'border-brand-200 bg-brand-50 text-brand-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    danger: 'border-rose-200 bg-rose-50 text-rose-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }
  return (
    <div className={cn('flex gap-3 rounded-lg border px-4 py-3 text-sm', tones[tone], className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5')}>{children}</div>}
      </div>
    </div>
  )
}
