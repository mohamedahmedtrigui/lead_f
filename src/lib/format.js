const dateTime = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
const dateOnly = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
const timeOnly = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' })
const relative = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })

export function formatDateTime(value) {
  if (!value) return '—'
  return dateTime.format(new Date(value))
}

export function formatDate(value) {
  if (!value) return '—'
  return dateOnly.format(new Date(value))
}

export function formatTime(value) {
  if (!value) return '—'
  return timeOnly.format(new Date(value))
}

export function formatRelative(value) {
  if (!value) return '—'
  const diff = (new Date(value).getTime() - Date.now()) / 1000
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  for (const [unit, seconds] of units) {
    if (Math.abs(diff) >= seconds) return relative.format(Math.round(diff / seconds), unit)
  }
  return "à l'instant"
}

export function formatDuration(totalSeconds) {
  if (totalSeconds == null) return '—'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** +21623173698 -> +216 23 173 698 */
export function formatPhone(phone) {
  if (!phone) return '—'
  const match = /^\+216(\d{2})(\d{3})(\d{3})$/.exec(phone)
  return match ? `+216 ${match[1]} ${match[2]} ${match[3]}` : phone
}

export function whatsappLink(phone) {
  return phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : null
}

/** <input type="datetime-local"> value -> ISO string with timezone. */
export function localInputToIso(value) {
  return value ? new Date(value).toISOString() : null
}

/** ISO string -> <input type="datetime-local"> value. */
export function isoToLocalInput(value) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function percent(value) {
  return `${Number(value ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`
}
