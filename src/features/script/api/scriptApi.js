import { http } from '@/lib/http'

export const scriptApi = {
  /** Script used by the wizard (any authenticated user). */
  async steps() {
    const { data } = await http.get('/script')
    return data
  },

  // --- Admin editor
  async adminSteps() {
    const { data } = await http.get('/admin/script-steps')
    return data
  },

  async update(id, payload) {
    const { data } = await http.put(`/admin/script-steps/${id}`, payload)
    return data
  },

  async reset(id) {
    const { data } = await http.post(`/admin/script-steps/${id}/reset`)
    return data
  },
}
