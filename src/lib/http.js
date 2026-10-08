import axios from 'axios'
import { env } from '@/config/env'

/**
 * Axios instance for the Laravel API.
 * Authentication uses Sanctum SPA session cookies + XSRF-TOKEN header.
 */
export const http = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

let csrfPromise = null

/** Fetches the XSRF-TOKEN cookie (once, unless forced). */
export function ensureCsrfCookie(force = false) {
  if (!csrfPromise || force) {
    csrfPromise = axios
      .get(`${env.apiUrl}/sanctum/csrf-cookie`, { withCredentials: true })
      .catch((error) => {
        csrfPromise = null
        throw error
      })
  }
  return csrfPromise
}

const unauthorizedListeners = new Set()

/** Subscribe to 401 responses (used by the AuthProvider to log out). */
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

http.interceptors.request.use(async (config) => {
  const method = (config.method ?? 'get').toLowerCase()
  if (!['get', 'head', 'options'].includes(method)) {
    await ensureCsrfCookie()
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const config = error.config

    // CSRF token expired: refresh it and retry once.
    if (status === 419 && config && !config.__retried) {
      config.__retried = true
      await ensureCsrfCookie(true)
      return http(config)
    }

    if (status === 401 && !config?.skipAuthRedirect) {
      unauthorizedListeners.forEach((listener) => listener())
    }

    return Promise.reject(error)
  },
)

/** Human readable message from an API error. */
export function errorMessage(error, fallback = 'Une erreur est survenue. Veuillez réessayer.') {
  const data = error?.response?.data
  if (data?.errors) {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first) && first[0]) return first[0]
  }
  if (data?.message) return data.message
  if (error?.code === 'ERR_NETWORK') return 'Serveur injoignable. Vérifiez votre connexion.'
  return fallback
}

/** Laravel validation errors as { field: 'message' }. */
export function fieldErrors(error) {
  const errors = error?.response?.data?.errors ?? {}
  return Object.fromEntries(Object.entries(errors).map(([key, messages]) => [key, messages[0]]))
}
