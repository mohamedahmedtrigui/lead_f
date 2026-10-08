import { ensureCsrfCookie, http } from '@/lib/http'

export const authApi = {
  async me() {
    const { data } = await http.get('/auth/me', { skipAuthRedirect: true })
    return data
  },

  async login(credentials) {
    await ensureCsrfCookie(true)
    const { data } = await http.post('/auth/login', credentials)
    return data
  },

  async register(payload) {
    await ensureCsrfCookie()
    const { data } = await http.post('/auth/register', payload)
    return data
  },

  async logout() {
    await http.post('/auth/logout')
  },
}
