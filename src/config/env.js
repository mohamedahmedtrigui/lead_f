export const env = Object.freeze({
  apiUrl: (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, ''),
  appName: import.meta.env.VITE_APP_NAME ?? 'MiralDrive Leads',
  isDev: import.meta.env.DEV,
})
