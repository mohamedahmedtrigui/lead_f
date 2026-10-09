import { Fragment } from 'react'
import { isB2b, isSharedApplicable } from '../config/steps'

/**
 * Placeholders usable in the admin script, e.g. "ena [Prénom] men MiralDrive"
 * or "men [DÉPART] lel [DESTINATION]". Matching ignores case and accents.
 */
export const PLACEHOLDERS = [
  ['[Prénom]', 'prénom du dispatcher'],
  ['[CLIENT]', 'nom du client'],
  ['[DÉPART]', 'lieu de départ'],
  ['[DESTINATION]', 'destination'],
  ['[FRÉQUENCE]', 'fréquence et jours'],
  ['[HORAIRE]', 'heure d’arrivée exacte (et de retour)'],
  ['[NOMBRE]', 'nombre de passagers'],
  ['[TRAJET PARTAGÉ / INDIVIDUEL]', 'type de trajet'],
  ['[JOUR]', 'jour du rappel'],
  ['[HEURE]', 'heure du rappel'],
]

const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim()

const hour = (time) => (time ? time.slice(0, 5).replace(':', 'h') : null)
const dayFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
const timeFormat = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

/** Values of the placeholders for the current call. */
export function buildScriptContext({ answers = {}, label = () => null, user, lead }) {
  const b2b = isB2b(answers)
  const days = (answers.days_of_week ?? []).map((d) => label('days_of_week', d)).join(', ')
  const frequency = [label('frequency', answers.frequency)?.toLowerCase(), days && `(${days})`].filter(Boolean).join(' ')
  const schedule = [
    answers.arrival_time ? `arrivée ${hour(answers.arrival_time)}` : hour(answers.departure_time),
    answers.trip_type === 'ROUND_TRIP' && answers.return_time ? `retour ${hour(answers.return_time)}` : null,
  ]
    .filter(Boolean)
    .join(', ')
  const passengers = b2b ? answers.estimated_passengers_per_trip : answers.passengers_count

  let trip = null
  if (!isSharedApplicable(answers)) trip = passengers ? 'trajet individuel' : null
  else if (answers.shared_transport === 'YES') trip = 'trajet partagé'
  else if (answers.shared_transport === 'MAYBE') trip = 'trajet partagé possible'
  else if (answers.shared_transport === 'NO') trip = 'trajet individuel'

  const callback = answers.callback_at ? new Date(answers.callback_at) : null

  return {
    PRENOM: user?.first_name,
    CLIENT: lead?.name,
    DEPART: answers.departure,
    DESTINATION: answers.destination,
    FREQUENCE: frequency,
    HORAIRE: schedule,
    NOMBRE: passengers ? String(passengers) : null,
    'TRAJET PARTAGE / INDIVIDUEL': trip,
    JOUR: callback ? dayFormat.format(callback) : null,
    HEURE: callback ? timeFormat.format(callback).replace(':', 'h') : null,
  }
}

const TOKEN = /(\[[^\]]+\])/g
const IS_TOKEN = /^\[[^\]]+\]$/
const valueOf = (token, context) => context?.[normalize(token.slice(1, -1))]

const LRM = '‎'
const ARABIC_RUN = /[؀-ۿ]+(?:\s+[؀-ۿ]+)*/g

/**
 * Wraps Arabic words with left-to-right marks so that, in the mostly Latin
 * dialect sentences, neighbouring digits and words keep their order
 * ("elli تستحق 3lih" instead of "elli 3 تستحقlih"). Same rule as the PDF.
 */
export const isolateArabic = (text) => text.replaceAll(LRM, '').replace(ARABIC_RUN, (run) => `${LRM}${run}${LRM}`)

/** Plain-text fill (labels, prompts): unknown placeholders are left as is. */
export function fillText(text, context) {
  if (!text) return text
  return isolateArabic(text.replace(TOKEN, (token) => valueOf(token, context) || token))
}

/** Rich fill: known values highlighted in blue, missing ones in amber. */
export function renderTemplate(text, context) {
  if (!text) return null
  return isolateArabic(text).split(TOKEN).map((part, index) => {
    if (!IS_TOKEN.test(part)) return <Fragment key={index}>{part}</Fragment>
    const value = valueOf(part, context)
    return value ? (
      <strong key={index} className="rounded bg-brand-100/70 px-1 font-semibold text-brand-800">
        {value}
      </strong>
    ) : (
      <span key={index} className="rounded bg-amber-100 px-1 font-medium text-amber-800" title="Information pas encore renseignée">
        {part}
      </span>
    )
  })
}
