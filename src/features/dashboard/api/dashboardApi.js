import { http } from '@/lib/http'

export const dashboardApi = {
  async dispatcher() {
    const { data } = await http.get('/dashboard')
    return data
  },

  async admin() {
    const { data } = await http.get('/admin/dashboard')
    return data
  },
}
