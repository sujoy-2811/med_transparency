import { apiClient } from './client'
import type { Region } from '../types'

export const regionsApi = {
  list: () => apiClient.get<Region[]>('/regions/').then(r => r.data),
  getById: (id: string) => apiClient.get<Region>(`/regions/${id}`).then(r => r.data),
}
