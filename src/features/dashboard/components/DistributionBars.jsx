/**
 * Simple magnitude comparison (one hue, value at the bar tip).
 * items: [{ key, label, count }]
 */
export function DistributionBars({ items = [] }) {
  const max = Math.max(1, ...items.map((i) => i.count))
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.key} className="grid grid-cols-[110px_1fr] items-center gap-3" title={`${item.label} : ${item.count}`}>
          <span className="truncate text-sm text-slate-600">{item.label}</span>
          <span className="flex h-6 items-center gap-2">
            <span className="h-4 rounded-r bg-brand-400" style={{ width: `${(item.count / max) * 100}%`, minWidth: item.count ? 4 : 0 }} />
            <span className="text-sm font-semibold tabular-nums text-slate-800">{item.count}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
