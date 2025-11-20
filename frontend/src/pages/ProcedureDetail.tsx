import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clock, TrendingUp, Database, CheckCircle, User, MessageCircle } from 'lucide-react'
import { proceduresApi } from '../api/procedures'
import { submissionsApi } from '../api/submissions'
import { CostRangeBar } from '../components/charts/CostRangeBar'
import { OutcomeScore } from '../components/charts/OutcomeScore'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { formatUSD } from '../utils/formatCurrency'

export function ProcedureDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const hospitalId = searchParams.get('hospital')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['procedure', slug],
    queryFn: () => proceduresApi.getBySlug(slug!),
    enabled: !!slug,
  })

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions', hospitalId, stats?.procedure.id],
    queryFn: () => submissionsApi.getHospitalSubmissions(hospitalId!, stats!.procedure.id),
    enabled: !!(hospitalId && stats?.procedure.id),
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!stats) return <div className="text-center py-20 text-[#6B7280]">Procedure not found</div>

  const { procedure, avg_cost_usd, min_cost_usd, max_cost_usd, avg_wait_days, avg_outcome_score, total_submissions } = stats

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#6B7280] hover:text-[#1B4965] mb-6 font-heading text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to results
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-2">{procedure.category}</Badge>
                <h1 className="font-heading font-extrabold text-[#1B4965] text-2xl">{procedure.name}</h1>
                {procedure.icd_code && <p className="text-xs text-[#6B7280] mt-1">ICD: {procedure.icd_code}</p>}
              </div>
            </div>
            {procedure.description && (
              <p className="text-[#4B5563] leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>{procedure.description}</p>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Avg Cost', value: avg_cost_usd ? formatUSD(avg_cost_usd) : 'N/A', icon: TrendingUp, color: 'text-[#E8A838]' },
              { label: 'Avg Wait', value: avg_wait_days ? `${Math.round(avg_wait_days)} days` : 'N/A', icon: Clock, color: 'text-[#5FA8D3]' },
              { label: 'Reports', value: total_submissions.toString(), icon: Database, color: 'text-[#1B4965]' },
              { label: 'Outcome', value: avg_outcome_score ? avg_outcome_score.toFixed(1) + '/10' : 'N/A', icon: CheckCircle, color: 'text-green-500' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center">
                <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
                <div className="font-heading font-extrabold text-[#1B4965] text-lg">{s.value}</div>
                <div className="text-xs text-[#6B7280]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Cost range */}
          {avg_cost_usd && min_cost_usd && max_cost_usd && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <h2 className="font-heading font-bold text-[#1B4965] mb-4">Cost Range</h2>
              <CostRangeBar min={min_cost_usd} avg={avg_cost_usd} max={max_cost_usd} />
              <p className="text-xs text-[#6B7280] mt-3" style={{ fontFamily: 'Lora, serif' }}>
                Cost range based on {total_submissions} verified patient reports. Costs include the procedure itself and may vary by hospital and complexity.
              </p>
            </div>
          )}

          {/* Testimonials */}
          {submissions.length > 0 && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
              <h2 className="font-heading font-bold text-[#1B4965] mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Patient Reports ({submissions.length})
              </h2>
              <div className="space-y-4">
                {submissions.filter(s => s.testimony).map(sub => (
                  <div key={sub.id} className="border-l-2 border-[#5FA8D3] pl-4 py-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#1B4965]/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-[#1B4965]" />
                      </div>
                      <div className="flex items-center gap-2">
                        <OutcomeScore score={sub.outcome_score} maxScore={10} size="sm" />
                        <span className="text-xs text-[#6B7280]">•</span>
                        <span className="text-xs font-heading font-semibold text-[#E8A838]">{formatUSD(sub.cost_usd)}</span>
                        <span className="text-xs text-[#6B7280]">•</span>
                        <span className="text-xs text-[#6B7280]">{sub.wait_days}d wait</span>
                        {sub.is_verified && <Badge variant="green">Verified</Badge>}
                      </div>
                    </div>
                    <p className="text-sm text-[#4B5563]" style={{ fontFamily: 'Lora, serif' }}>"{sub.testimony}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#1B4965] text-white rounded-xl p-5">
            <h3 className="font-heading font-bold mb-3">Get AI Advice</h3>
            <p className="text-white/80 text-sm mb-4" style={{ fontFamily: 'Lora, serif' }}>
              Describe your situation and budget. Our AI advisor will recommend the best options for you.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => navigate('/ai')}>
              Ask AI Advisor
            </Button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
            <h3 className="font-heading font-bold text-[#1B4965] mb-3">Had this procedure?</h3>
            <p className="text-sm text-[#6B7280] mb-4" style={{ fontFamily: 'Lora, serif' }}>Share your experience to help others make better decisions.</p>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/contribute')}>
              Submit your data
            </Button>
          </div>

          {avg_outcome_score && (
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
              <h3 className="font-heading font-bold text-[#1B4965] mb-3">Outcome Score</h3>
              <OutcomeScore score={avg_outcome_score} />
              <p className="text-xs text-[#6B7280] mt-2">Based on {total_submissions} patient reports</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
