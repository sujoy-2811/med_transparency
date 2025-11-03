import { apiClient } from './client'
import type { SearchResponse, SearchFilters } from '../types'

export const searchApi = {
  search: (filters: Partial<SearchFilters>) => {
    const params: Record<string, string> = {}
    if (filters.procedure) params.procedure = filters.procedure
    if (filters.region) params.region = filters.region
    if (filters.budget_min) params.budget_min = filters.budget_min
    if (filters.budget_max) params.budget_max = filters.budget_max
    if (filters.max_wait_days) params.max_wait_days = filters.max_wait_days
    if (filters.sort_by) params.sort_by = filters.sort_by
    return apiClient.get<SearchResponse>('/search/', { params }).then(r => r.data)
  },
}
