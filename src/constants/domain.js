/**
 * Labels and colors of backend enums. Option labels of the qualification
 * questions are NOT here: they come from the admin-editable script.
 */

export const ROLES = Object.freeze({ ADMIN: 'ADMIN', DISPATCHER: 'DISPATCHER' })

export const LEAD_STATUS = {
  PENDING: { label: 'À traiter', tone: 'slate' },
  IN_PROGRESS: { label: 'En cours', tone: 'blue' },
  CALLBACK: { label: 'Rappel', tone: 'violet' },
  QUALIFIED: { label: 'Qualifié', tone: 'green' },
  CONVERTED: { label: 'Converti', tone: 'emerald' },
  NRP: { label: 'NRP', tone: 'amber' },
  NOT_INTERESTED: { label: 'Pas intéressé', tone: 'rose' },
  INVALID: { label: 'Invalide', tone: 'zinc' },
}

export const INTEREST_LEVEL = {
  HOT: { label: 'HOT', tone: 'red', description: '80 – 100' },
  WARM: { label: 'WARM', tone: 'orange', description: '60 – 79' },
  INTERESTED: { label: 'Intéressé', tone: 'blue', description: '40 – 59' },
  LOW: { label: 'Faible', tone: 'slate', description: '0 – 39' },
}

export const NEXT_ACTION = {
  QUALIFIED: 'Qualifié',
  CALLBACK: 'Rappeler',
  SEND_QUOTATION: 'Envoyer un devis',
  TRANSFER_TO_SALES: 'Transférer au commercial',
  FOLLOW_UP: 'Relance / suivi',
  NOT_INTERESTED: 'Pas intéressé',
  NRP: 'NRP',
}

/** "Pas intéressé" and "NRP" cannot be combined with another action. */
export const EXCLUSIVE_NEXT_ACTIONS = ['NOT_INTERESTED', 'NRP']

/** The main action (drives the lead status), same order as the API. */
export function primaryNextAction(actions = []) {
  return ['NRP', 'NOT_INTERESTED', 'CALLBACK', 'SEND_QUOTATION', 'TRANSFER_TO_SALES', 'FOLLOW_UP', 'QUALIFIED'].find((a) => actions.includes(a)) ?? null
}

/** Chosen actions of a qualification (older ones only have next_action). */
export const nextActionsOf = (q) => (q?.next_actions?.length ? q.next_actions : q?.next_action ? [q.next_action] : [])

export const formatNextActions = (q) =>
  nextActionsOf(q)
    .map((a) => NEXT_ACTION[a] ?? a)
    .join(', ')

export const CALL_OUTCOME = {
  CONNECTED: { label: 'Joint', tone: 'green' },
  NO_ANSWER: { label: 'Pas de réponse', tone: 'amber' },
  CALLBACK_REQUESTED: { label: 'Rappel demandé', tone: 'violet' },
  INVALID_NUMBER: { label: 'Numéro invalide', tone: 'zinc' },
  NOT_INTERESTED: { label: 'Pas intéressé', tone: 'rose' },
}

export const USER_STATUS = {
  PENDING: { label: 'En attente', tone: 'amber' },
  APPROVED: { label: 'Actif', tone: 'green' },
  REJECTED: { label: 'Refusé', tone: 'rose' },
  DEACTIVATED: { label: 'Désactivé', tone: 'zinc' },
}

export const SCORE_RULES = {
  daily_transport: 'Transport quotidien',
  recurring_route: 'Trajet récurrent',
  multiple_passengers: 'Plusieurs passagers',
  accepts_shared: 'Accepte le transport partagé',
  maybe_shared: 'Ouvert au partage (peut-être)',
  b2b_need: 'Besoin entreprise (B2B)',
  requests_quotation: 'Demande un devis',
  requests_callback: 'Demande un rappel',
  positive_experience: 'Expérience MiralDrive positive',
}

export const AUDIT_EVENT = {
  LEAD_ASSIGNED: 'Lead assigné',
  LEAD_REASSIGNED: 'Lead réassigné',
  LEAD_UNASSIGNED: 'Lead désassigné',
  LEADS_IMPORTED: 'Import de leads',
  CALL_STARTED: 'Appel démarré',
  CALL_ENDED: 'Appel terminé',
  QUALIFICATION_STARTED: 'Qualification démarrée',
  QUALIFICATION_COMPLETED: 'Qualification terminée',
  STATUS_CHANGED: 'Statut modifié',
  SCORE_CHANGED: 'Score modifié',
  CALLBACK_SCHEDULED: 'Rappel programmé',
  NRP_REGISTERED: 'NRP enregistré',
  NOTE_ADDED: 'Note ajoutée',
  USER_REGISTERED: 'Inscription',
  USER_APPROVED: 'Compte approuvé',
  USER_REJECTED: 'Inscription refusée',
  USER_DEACTIVATED: 'Compte désactivé',
  USER_REACTIVATED: 'Compte réactivé',
  SCRIPT_UPDATED: 'Script modifié',
}

export const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export const FUNNEL_STEPS = {
  leads: 'Leads',
  contacted: 'Contactés',
  conversations: 'Conversations',
  qualified: 'Qualifiés',
  hot: 'HOT',
  quotation: 'Devis',
  converted: 'Convertis',
}

export const toOptions = (map) =>
  Object.entries(map).map(([value, item]) => ({ value, label: typeof item === 'string' ? item : item.label }))
