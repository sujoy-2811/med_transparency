import { apiClient } from './client'
import type { Procedure, ProcedureStats } from '../types'

export const proceduresApi = {
  list: (category?: string) =>
    apiClient.get<Procedure[]>('/procedures/', { params: category ? { category } : {} }).then(r => r.data),
  autocomplete: (q: string) =>
    apiClient.get<Procedure[]>('/procedures/autocomplete', { params: { q } }).then(r => r.data),
  getBySlug: (slug: string) =>
    apiClient.get<ProcedureStats>(`/procedures/${slug}`).then(r => r.data),
}
