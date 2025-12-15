import { apiClient } from './client'
import type { Alert } from '../types'

export const alertsApi = {
  list: () => apiClient.get<Alert[]>('/alerts/').then(r => r.data),
  create: (data: { procedure_id: string; region_id?: string; target_cost_usd: number }) =>
    apiClient.post<Alert>('/alerts/', data).then(r => r.data),
  delete: (id: string) => apiClient.delete(`/alerts/${id}`),
}
