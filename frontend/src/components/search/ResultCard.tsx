import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, TrendingUp, Database, Award } from 'lucide-react'
import type { SearchResult } from '../../types'
import { formatUSD, formatRange } from '../../utils/formatCurrency'
import { OutcomeScore } from '../charts/OutcomeScore'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useSearchStore } from '../../store/searchStore'

interface Props {
  result: SearchResult
  rank: number
}

export function ResultCard({ result, rank }: Props) {
  const navigate = useNavigate()
  const { setFilters, triggerSearch } = useSearchStore()
  const { hospital, procedure, avg_cost_usd, min_cost_usd, max_cost_usd, avg_wait_days, avg_outcome_score, data_points } = result

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04 }}
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${rank === 0 ? 'border-[#1B4965]/30 ring-1 ring-[#1B4965]/20' : 'border-[#E5E7EB]'}`}
    >
      {rank === 0 && (
        <div className="bg-[#1B4965] text-white text-xs font-heading font-semibold px-4 py-1.5 flex items-center gap-1.5">
          <Award className="w-3 h-3" /> Best Match
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#6B7280] text-lg">{hospital.region.flag_emoji}</span>
              <h3 className="font-heading font-bold text-[#1B4965] text-base leading-tight">{hospital.name}</h3>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
              <MapPin className="w-3.5 h-3.5" />
              <span>{hospital.city}, {hospital.region.name}</span>
            </div>
            {hospital.accreditation && (
              <Badge variant="secondary" className="mt-2">{hospital.accreditation} Accredited</Badge>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-heading font-extrabold text-[#E8A838]">{formatUSD(avg_cost_usd)}</div>
            <div className="text-xs text-[#6B7280] mt-0.5">avg cost</div>
            <div className="text-xs text-[#9CA3AF] mt-0.5">{formatRange(min_cost_usd, max_cost_usd)}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-[#F3F4F6] mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[#6B7280] mb-1">
              <Clock className="w-3 h-3" /><span className="text-xs font-heading font-medium">Wait</span>
            </div>
            <div className="font-heading font-bold text-[#1B4965] text-sm">{Math.round(avg_wait_days)}d</div>
          </div>
          <div className="text-center border-x border-[#F3F4F6]">
            <div className="flex items-center justify-center gap-1 text-[#6B7280] mb-1">
              <TrendingUp className="w-3 h-3" /><span className="text-xs font-heading font-medium">Outcome</span>
            </div>
            <OutcomeScore score={avg_outcome_score} size="sm" />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[#6B7280] mb-1">
              <Database className="w-3 h-3" /><span className="text-xs font-heading font-medium">Reports</span>
            </div>
            <div className="font-heading font-bold text-[#1B4965] text-sm">{data_points}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            className="flex-1"
            onClick={() => navigate(`/procedure/${procedure.slug}?hospital=${hospital.id}`)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setFilters({ region: hospital.region.id }); triggerSearch() }}
          >
            {hospital.region.flag_emoji} {hospital.region.name}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
