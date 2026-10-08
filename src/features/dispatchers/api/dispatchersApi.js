import { http } from '@/lib/http'

export const dispatchersApi = {
  async list(params) {
    const { data } = await http.get('/admin/dispatchers', { params })
    return data
  },

  async create(payload) {
    const { data } = await http.post('/admin/dispatchers', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await http.patch(`/admin/dispatchers/${id}`, payload)
    return data
  },

  async action(id, action, payload) {
    const { data } = await http.post(`/admin/dispatchers/${id}/${action}`, payload)
    return data
  },
}
