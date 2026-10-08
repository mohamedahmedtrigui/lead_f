import { http } from '@/lib/http'

export const qualificationApi = {
  async saveDraft(leadId, answers) {
    const { data } = await http.patch(`/leads/${leadId}/qualification`, answers)
    return data
  },

  async complete(leadId, answers) {
    const { data } = await http.post(`/leads/${leadId}/qualification/complete`, answers)
    return data
  },
}
