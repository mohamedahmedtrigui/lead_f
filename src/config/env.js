/**
 * VITE_API_URL:
 *   - "http://localhost:8000"  → API on another origin (local development)
 *   - "same-origin"            → API reached on the SPA's own origin through
 *                                 /api and /sanctum rewrites (Render deployment)
 */
const rawApiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').trim()

export const env = Object.freeze({
  apiUrl: rawApiUrl === 'same-origin' ? '' : rawApiUrl.replace(/\/$/, ''),
  appName: import.meta.env.VITE_APP_NAME ?? 'MiralDrive Leads',
  isDev: import.meta.env.DEV,
})
