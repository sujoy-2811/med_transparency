import { create } from 'zustand'
import type { SearchFilters } from '../types'

interface SearchState {
  filters: SearchFilters
  triggerCount: number
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
  triggerSearch: () => void
}

const DEFAULT_FILTERS: SearchFilters = {
  procedure: '',
  region: '',
  budget_min: '',
  budget_max: '',
  max_wait_days: '',
  sort_by: 'cost',
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: DEFAULT_FILTERS,
  triggerCount: 0,
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  triggerSearch: () => set((s) => ({ triggerCount: s.triggerCount + 1 })),
}))
