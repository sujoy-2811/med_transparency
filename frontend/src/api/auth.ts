import { apiClient } from './client'
import type { User } from '../types'

export const authApi = {
  register: (email: string, password: string, display_name: string) =>
    apiClient.post<User>('/auth/register', { email, password, display_name }).then(r => r.data),
  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string; refresh_token: string }>('/auth/login', { email, password }).then(r => r.data),
  me: () => apiClient.get<User>('/users/me').then(r => r.data),
}
