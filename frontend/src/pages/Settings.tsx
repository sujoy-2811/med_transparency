import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Plus, Trash2, Lock, Mail } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { alertsApi } from '../api/alerts'
import { proceduresApi } from '../api/procedures'
import { regionsApi } from '../api/regions'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatUSD } from '../utils/formatCurrency'

export function Settings() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [newAlert, setNewAlert] = useState({ procedure_id: '', region_id: '', target_cost_usd: '' })

  const { data: alerts = [] } = useQuery({ queryKey: ['alerts'], queryFn: alertsApi.list })
  const { data: procedures = [] } = useQuery({ queryKey: ['procedures'], queryFn: () => proceduresApi.list() })
  const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: regionsApi.list })

  const createAlert = useMutation({
    mutationFn: () => alertsApi.create({ procedure_id: newAlert.procedure_id, region_id: newAlert.region_id || undefined, target_cost_usd: parseFloat(newAlert.target_cost_usd) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['alerts'] }); setShowAlertForm(false); setNewAlert({ procedure_id: '', region_id: '', target_cost_usd: '' }) },
  })

  const deleteAlert = useMutation({
    mutationFn: alertsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })

  if (!user) return (
    <div className="text-center py-20">
      <p className="font-heading text-[#6B7280] mb-4">Sign in to manage settings</p>
      <Button onClick={() => navigate('/login')}>Sign in</Button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-heading font-extrabold text-[#1B4965] text-2xl mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Account */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <h2 className="font-heading font-bold text-[#1B4965] flex items-center gap-2 mb-4"><Lock className="w-4 h-4" /> Account</h2>
          <div className="flex items-center gap-3 p-3 bg-[#F8F9FA] rounded-lg">
            <Mail className="w-4 h-4 text-[#6B7280]" />
            <div>
              <p className="font-heading font-medium text-sm text-[#1B4965]">{user.display_name}</p>
              <p className="text-xs text-[#6B7280]">{user.email}</p>
            </div>
            {user.is_verified && <Badge variant="green" className="ml-auto">Verified</Badge>}
          </div>
        </div>

        {/* Price alerts */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-[#1B4965] flex items-center gap-2"><Bell className="w-4 h-4" /> Price Alerts</h2>
            <Button size="sm" onClick={() => setShowAlertForm(!showAlertForm)} icon={<Plus className="w-4 h-4" />}>New alert</Button>
          </div>

          {showAlertForm && (
            <div className="bg-[#F8F9FA] rounded-xl p-5 mb-5 space-y-3">
              <h3 className="font-heading font-semibold text-[#1B4965] text-sm">New price alert</h3>
              <Select label="Procedure" options={[{ value: '', label: 'Select procedure...' }, ...procedures.map(p => ({ value: p.id, label: p.name }))]}
                value={newAlert.procedure_id} onChange={e => setNewAlert(a => ({ ...a, procedure_id: e.target.value }))} />
              <Select label="Region (optional)" options={[{ value: '', label: 'Any region' }, ...regions.map(r => ({ value: r.id, label: `${r.flag_emoji} ${r.name}` }))]}
                value={newAlert.region_id} onChange={e => setNewAlert(a => ({ ...a, region_id: e.target.value }))} />
              <Input label="Alert when avg cost drops below (USD)" type="number" placeholder="e.g. 8000"
                value={newAlert.target_cost_usd} onChange={e => setNewAlert(a => ({ ...a, target_cost_usd: e.target.value }))} />
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={() => createAlert.mutate()} loading={createAlert.isPending} disabled={!newAlert.procedure_id || !newAlert.target_cost_usd}>Create alert</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAlertForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {alerts.length === 0 ? (
            <p className="text-sm text-[#6B7280]">No alerts set. Create one to be notified when costs drop for a procedure you're interested in.</p>
          ) : (
            <div className="space-y-2">
              {alerts.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 border border-[#E5E7EB] rounded-lg">
                  <div>
                    <p className="font-heading font-semibold text-sm text-[#1B4965]">{procedures.find(p => p.id === a.procedure_id)?.name}</p>
                    <p className="text-xs text-[#6B7280]">Alert at ≤ {formatUSD(a.target_cost_usd)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.is_active ? 'success' : 'muted'}>{a.is_active ? 'Active' : 'Paused'}</Badge>
                    <button onClick={() => deleteAlert.mutate(a.id)} className="text-[#6B7280] hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
          <h2 className="font-heading font-bold text-[#1B4965] mb-4">Privacy</h2>
          <div className="space-y-3 text-sm text-[#6B7280]" style={{ fontFamily: 'Lora, serif' }}>
            <p>All your submissions are anonymous and aggregated. Your email is never linked to individual data points.</p>
            <p>You can request deletion of your account and all associated data by contacting us at privacy@medtransparency.app</p>
          </div>
        </div>
      </div>
    </div>
  )
}
