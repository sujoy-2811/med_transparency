import { apiClient } from './client'
import type { Hospital } from '../types'

export const hospitalsApi = {
  list: (region_id?: string) =>
    apiClient.get<Hospital[]>('/hospitals/', { params: region_id ? { region_id } : undefined }).then(r => r.data),
}
