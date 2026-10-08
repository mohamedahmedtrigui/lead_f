import { useEffect, useState } from 'react'
import { formatDuration } from '@/lib/format'

export function CallTimer({ startedAt }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const seconds = Math.max(0, (now - new Date(startedAt).getTime()) / 1000)
  const overTime = seconds > 6 * 60

  return (
    <span className={overTime ? 'font-mono font-semibold tabular-nums text-amber-600' : 'font-mono font-semibold tabular-nums'}>
      {formatDuration(seconds)}
    </span>
  )
}
