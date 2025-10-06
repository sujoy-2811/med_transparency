export interface Region {
  id: string
  name: string
  country_code: string
  healthcare_summary: string | null
  flag_emoji: string | null
}

export interface Procedure {
  id: string
  name: string
  category: string
  slug: string
  icd_code: string | null
  description: string | null
}

export interface Hospital {
  id: string
  name: string
  city: string
  accreditation: string | null
  latitude: number | null
  longitude: number | null
  website: string | null
  region: Region
}

export interface SearchResult {
  hospital: Hospital
  procedure: Procedure
  avg_cost_usd: number
  min_cost_usd: number
  max_cost_usd: number
  avg_wait_days: number
  avg_outcome_score: number
  data_points: number
  rank_score: number
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  procedure_name: string | null
  region_name: string | null
}

export interface Submission {
  id: string
  procedure_id: string
  hospital_id: string
  cost_usd: number
  original_cost: number
  currency: string
  wait_days: number
  outcome_score: number
  testimony: string | null
  is_verified: boolean
  created_at: string
}

export interface User {
  id: string
  email: string
  display_name: string
  is_verified: boolean
  created_at: string
}

export interface Alert {
  id: string
  procedure_id: string
  region_id: string | null
  target_cost_usd: number
  is_active: boolean
}

export interface ProcedureStats {
  procedure: Procedure
  avg_cost_usd: number | null
  min_cost_usd: number | null
  max_cost_usd: number | null
  avg_wait_days: number | null
  avg_outcome_score: number | null
  total_submissions: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export type ToolStatus = 'running' | 'done'

export interface ToolCallState {
  id: string
  name: string
  args: Record<string, unknown>
  result: unknown | null
  status: ToolStatus
}

export type AgentItem =
  | { kind: 'chat'; role: 'user' | 'assistant'; content: string }
  | { kind: 'tools'; calls: ToolCallState[] }

export interface SearchFilters {
  procedure: string
  region: string
  budget_min: string
  budget_max: string
  max_wait_days: string
  sort_by: 'cost' | 'outcome' | 'wait'
}
