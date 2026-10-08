import { useState } from 'react'
import { FUNNEL_STEPS } from '@/constants/domain'
import { percent } from '@/lib/format'

/**
 * Lead funnel as single-hue horizontal bars (one series: no legend needed).
 * Each bar shows its count at the tip; hover shows the rates.
 */
export function FunnelChart({ steps = [] }) {
  const [hover, setHover] = useState(null)
  const max = Math.max(1, ...steps.map((s) => s.count))

  return (
    <div>
      <ol className="space-y-2.5">
        {steps.map((step, index) => {
          const previous = steps[index - 1]
          const stepRate = previous && previous.count > 0 ? (step.count / previous.count) * 100 : null
          const width = (step.count / max) * 100
          return (
            <li
              key={step.key}
              className="relative grid grid-cols-[110px_1fr] items-center gap-3"
              onMouseEnter={() => setHover(step.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(step.key)}
              onBlur={() => setHover(null)}
              tabIndex={0}
            >
              <span className="truncate text-sm text-slate-600">{FUNNEL_STEPS[step.key] ?? step.key}</span>
              <span className="flex h-7 items-center gap-2">
                <span
                  className="h-5 rounded-r bg-brand-600 transition-[width] duration-500"
                  style={{ width: `${Math.max(width, step.count > 0 ? 1 : 0)}%`, opacity: hover && hover !== step.key ? 0.45 : 1 }}
                />
                <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-slate-900">{step.count}</span>
                <span className="whitespace-nowrap text-xs tabular-nums text-slate-500">{percent(step.rate)}</span>
              </span>
              {hover === step.key && (
                <span className="pointer-events-none absolute left-[120px] top-8 z-10 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
                  <span className="block font-semibold">{FUNNEL_STEPS[step.key]}</span>
                  <span className="block">{step.count} lead(s) · {percent(step.rate)} du total</span>
                  {stepRate != null && <span className="block text-slate-300">{percent(stepRate)} de l’étape précédente</span>}
                </span>
              )}
            </li>
          )
        })}
      </ol>
      {/* Accessible table view of the same data */}
      <table className="sr-only">
        <caption>Entonnoir des leads</caption>
        <thead>
          <tr>
            <th>Étape</th>
            <th>Leads</th>
            <th>Taux</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step) => (
            <tr key={step.key}>
              <td>{FUNNEL_STEPS[step.key]}</td>
              <td>{step.count}</td>
              <td>{percent(step.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
