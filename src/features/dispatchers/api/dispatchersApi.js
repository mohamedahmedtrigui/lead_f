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

  /** Gives N untouched leads to an active dispatcher. */
  async allocate(id, payload) {
    const { data } = await http.post(`/admin/dispatchers/${id}/allocate`, payload)
    return data
  },

  /** { unassigned, reassignable } leads usable by an automatic allocation. */
  async allocatable() {
    const { data } = await http.get('/admin/leads/allocatable')
    return data
  },

  /** Safe deletion (archive). */
  async remove(id, payload) {
    const { data } = await http.delete(`/admin/dispatchers/${id}`, { data: payload })
    return data
  },

  async action(id, action, payload) {
    const { data } = await http.post(`/admin/dispatchers/${id}/${action}`, payload)
    return data
  },
}
