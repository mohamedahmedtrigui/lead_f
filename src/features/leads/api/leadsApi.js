import { http } from '@/lib/http'

const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined && !(Array.isArray(value) && !value.length)),
  )

export const leadsApi = {
  async list(params) {
    const query = clean(params)
    if (Array.isArray(query.status)) query.status = query.status.join(',')
    const { data } = await http.get('/leads', { params: query })
    return data
  },

  async get(id) {
    const { data } = await http.get(`/leads/${id}`)
    return data
  },

  async timeline(id) {
    const { data } = await http.get(`/leads/${id}/timeline`)
    return data
  },

  /** PDF file of the lead (details + full conversation + history). */
  async report(id, { download = false } = {}) {
    return http.get(`/leads/${id}/report`, { params: download ? { download: 1 } : {}, responseType: 'blob' })
  },

  async addNote(id, body) {
    const { data } = await http.post(`/leads/${id}/notes`, { body })
    return data
  },

  // --- Call workflow (dispatcher)
  async startCall(id) {
    const { data } = await http.post(`/leads/${id}/calls`)
    return data
  },

  async registerOutcome(id, payload) {
    const { data } = await http.post(`/leads/${id}/calls/outcome`, payload)
    return data
  },

  // --- Admin
  async assign(payload) {
    const { data } = await http.post('/admin/leads/assign', payload)
    return data
  },

  async distribute(payload) {
    const { data } = await http.post('/admin/leads/distribute', payload)
    return data
  },

  async updateStatus(id, payload) {
    const { data } = await http.patch(`/admin/leads/${id}/status`, payload)
    return data
  },

  async exportQualified(params) {
    const response = await http.get('/admin/leads/export', { params: clean(params), responseType: 'blob' })
    return response
  },

  async imports() {
    const { data } = await http.get('/admin/leads/imports')
    return data.data
  },

  async importCsv({ file, distribute, strategy }) {
    const form = new FormData()
    form.append('file', file)
    form.append('distribute', distribute ? '1' : '0')
    if (strategy) form.append('strategy', strategy)
    const { data } = await http.post('/admin/leads/imports', form)
    return data
  },
}
