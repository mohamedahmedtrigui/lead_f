import { http } from '@/lib/http'

const clean = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))

export const activityApi = {
  async calls(params) {
    const { data } = await http.get('/admin/calls', { params: clean(params) })
    return data
  },

  async audit(params) {
    const { data } = await http.get('/admin/audit-logs', { params: clean(params) })
    return data
  },
}
