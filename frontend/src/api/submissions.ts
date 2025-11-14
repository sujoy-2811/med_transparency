import { apiClient } from './client'
import type { Submission } from '../types'

export interface SubmissionCreate {
  procedure_id: string
  hospital_id: string
  cost_usd: number
  original_cost: number
  currency: string
  wait_days: number
  outcome_score: number
  testimony?: string
}

export const submissionsApi = {
  create: (data: SubmissionCreate) =>
    apiClient.post<Submission>('/submissions/', data).then(r => r.data),
  getHospitalSubmissions: (hospitalId: string, procedureId: string) =>
    apiClient.get<Submission[]>(`/hospitals/${hospitalId}/submissions/${procedureId}`).then(r => r.data),
  myHistory: () =>
    apiClient.get<Submission[]>('/users/me/history').then(r => r.data),
}
