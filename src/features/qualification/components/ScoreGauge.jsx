import { InterestBadge } from '@/components/badges'
import { SCORE_RULES } from '@/constants/domain'
import { cn } from '@/lib/cn'

const barColor = {
  HOT: 'bg-red-500',
  WARM: 'bg-orange-500',
  INTERESTED: 'bg-brand-500',
  LOW: 'bg-slate-400',
}

/** Interest score 0-100 with its level thresholds and score breakdown. */
export function ScoreGauge({ score = 0, level = 'LOW', breakdown = [], showBreakdown = true, size = 'md' }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Score d’intérêt</p>
          <p className={cn('font-bold tabular-nums text-slate-900', size === 'lg' ? 'text-5xl' : 'text-4xl')}>
            {score}
            <span className="text-base font-medium text-slate-400"> / 100</span>
          </p>
        </div>
        <InterestBadge level={level} />
      </div>

      <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label="Score d’intérêt">
        <div className={cn('h-full rounded-full transition-all duration-500', barColor[level] ?? barColor.LOW)} style={{ width: `${score}%` }} />
        {[40, 60, 80].map((mark) => (
          <span key={mark} className="absolute inset-y-0 w-px bg-white" style={{ left: `${mark}%` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
        <span>LOW</span>
        <span className="pl-6">INTÉRESSÉ</span>
        <span>WARM</span>
        <span>HOT</span>
      </div>

      {showBreakdown && (
        <ul className="mt-3 space-y-1">
          {breakdown.length === 0 && <li className="text-xs text-slate-400">Le score se construit au fil des réponses.</li>}
          {breakdown.map((item) => (
            <li key={item.rule} className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{SCORE_RULES[item.rule] ?? item.rule}</span>
              <span className="font-semibold tabular-nums text-emerald-600">+{item.points}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
