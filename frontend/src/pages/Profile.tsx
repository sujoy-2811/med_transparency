import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Bell, History, LogOut, Trash2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { alertsApi } from '../api/alerts'
import { submissionsApi } from '../api/submissions'
import { proceduresApi } from '../api/procedures'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { formatUSD } from '../utils/formatCurrency'

export function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const qc = useQueryClient()

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({ queryKey: ['alerts'], queryFn: alertsApi.list })
  const { data: history = [], isLoading: historyLoading } = useQuery({ queryKey: ['history'], queryFn: submissionsApi.myHistory })
  const { data: procedures = [] } = useQuery({ queryKey: ['procedures'], queryFn: () => proceduresApi.list() })

  const deleteAlert = useMutation({
    mutationFn: alertsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })

  const procName = (id: string) => procedures.find(p => p.id === id)?.name ?? id

  if (!user) return (
    <div className="text-center py-20">
      <p className="font-heading text-[#6B7280] mb-4">Sign in to view your profile</p>
      <Button onClick={() => navigate('/login')}>Sign in</Button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-[#1B4965]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-[#1B4965]" />
            </div>
            <h2 className="font-heading font-bold text-[#1B4965] text-lg">{user.display_name}</h2>
            <p className="text-sm text-[#6B7280]">{user.email}</p>
            {user.is_verified && <Badge variant="green" className="mt-2">Verified</Badge>}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-[#E5E7EB]">
              <div className="text-center">
                <div className="font-heading font-bold text-xl text-[#1B4965]">{history.length}</div>
                <div className="text-xs text-[#6B7280]">Submissions</div>
              </div>
              <div className="text-center">
                <div className="font-heading font-bold text-xl text-[#1B4965]">{alerts.length}</div>
                <div className="text-xs text-[#6B7280]">Active alerts</div>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-4" size="sm" onClick={() => { logout(); navigate('/') }} icon={<LogOut className="w-4 h-4" />}>
              Sign out
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {/* Alerts */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[#1B4965] flex items-center gap-2"><Bell className="w-4 h-4" /> Price Alerts</h3>
              <Button size="sm" variant="ghost" onClick={() => navigate('/settings')}>Manage</Button>
            </div>
            {alertsLoading ? <Spinner size="sm" /> : alerts.length === 0 ? (
              <p className="text-sm text-[#6B7280]">No active alerts. Set alerts to be notified when costs drop.</p>
            ) : (
              <div className="space-y-2">
                {alerts.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
                    <div>
                      <p className="font-heading font-semibold text-sm text-[#1B4965]">{procName(a.procedure_id)}</p>
                      <p className="text-xs text-[#6B7280]">Alert when avg cost ≤ {formatUSD(a.target_cost_usd)}</p>
                    </div>
                    <button onClick={() => deleteAlert.mutate(a.id)} className="text-[#6B7280] hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submission history */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="font-heading font-bold text-[#1B4965] flex items-center gap-2 mb-4"><History className="w-4 h-4" /> Submission History</h3>
            {historyLoading ? <Spinner size="sm" /> : history.length === 0 ? (
              <div>
                <p className="text-sm text-[#6B7280] mb-3">No submissions yet. Share your healthcare experience!</p>
                <Button size="sm" onClick={() => navigate('/contribute')}>Contribute data</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg">
                    <div>
                      <p className="font-heading font-semibold text-sm text-[#1B4965]">{procName(s.procedure_id)}</p>
                      <p className="text-xs text-[#6B7280]">{new Date(s.created_at).toLocaleDateString()} • {s.wait_days}d wait • Outcome {s.outcome_score}/10</p>
                    </div>
                    <div className="text-right">
                      <div className="font-heading font-bold text-[#E8A838]">{formatUSD(s.cost_usd)}</div>
                      {s.is_verified && <Badge variant="green" className="mt-1">Verified</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
