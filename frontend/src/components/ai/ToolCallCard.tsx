import { Search, DollarSign, Globe, Building2, MessageSquare, CheckCircle2, Loader2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ToolCallState } from '../../types'

interface ToolConfig {
  label: string
  icon: LucideIcon
  color: string
  bg: string
}

const TOOL_CONFIG: Record<string, ToolConfig> = {
  search_procedures:       { label: 'Searching procedures',        icon: Search,       color: '#7C3AED', bg: '#F5F3FF' },
  get_cost_stats:          { label: 'Fetching cost data',          icon: DollarSign,   color: '#059669', bg: '#ECFDF5' },
  compare_regions:         { label: 'Comparing regions',           icon: Globe,        color: '#0891B2', bg: '#ECFEFF' },
  get_top_hospitals:       { label: 'Finding top hospitals',       icon: Building2,    color: '#D97706', bg: '#FFFBEB' },
  get_patient_testimonies: { label: 'Retrieving patient testimonies', icon: MessageSquare, color: '#DB2777', bg: '#FDF2F8' },
}

function formatArgs(args: Record<string, unknown>): string {
  const parts: string[] = []
  if (args.procedure_slug) parts.push((args.procedure_slug as string).replace(/-/g, ' '))
  if (args.region_code)    parts.push(args.region_code as string)
  if (args.query)          parts.push(`"${args.query}"`)
  if (args.limit)          parts.push(`top ${args.limit}`)
  return parts.join(' · ')
}

function formatResult(name: string, result: unknown): string {
  if (!result || typeof result !== 'object') return 'Done'
  const r = result as Record<string, unknown>
  if (r.error) return `⚠ ${r.error}`

  switch (name) {
    case 'get_cost_stats': {
      const cost = Number(r.avg_cost_usd).toLocaleString()
      return `Avg $${cost} USD · ${r.avg_wait_days}d wait · ${r.avg_outcome_score}/10 outcome · ${r.data_points} reports`
    }
    case 'compare_regions': {
      const regions = (r.regions as any[]) || []
      if (!regions.length) return 'No regional data found'
      const cheapest = regions[0]
      return `${regions.length} regions · Cheapest: ${cheapest.flag} ${cheapest.name} at $${Number(cheapest.avg_cost_usd).toLocaleString()}`
    }
    case 'get_top_hospitals': {
      const hospitals = (r.hospitals as any[]) || []
      if (!hospitals.length) return 'No hospitals found'
      const top = hospitals[0]
      return `${hospitals.length} hospitals · Top: ${top.flag} ${top.name} (${top.avg_outcome_score}/10)`
    }
    case 'get_patient_testimonies': {
      const tms = (r.testimonies as any[]) || []
      if (!tms.length) return 'No testimonies found'
      return `${tms.length} patient ${tms.length === 1 ? 'testimony' : 'testimonies'} retrieved`
    }
    case 'search_procedures': {
      const procs = (r.procedures as any[]) || []
      return procs.length ? procs.map((p: any) => p.name).join(', ') : 'None found'
    }
    default:
      return 'Complete'
  }
}

interface Props {
  call: ToolCallState
}

export function ToolCallCard({ call }: Props) {
  const config = TOOL_CONFIG[call.name] ?? {
    label: call.name,
    icon: Search,
    color: '#6B7280',
    bg: '#F9FAFB',
  }
  const Icon = config.icon
  const isDone = call.status === 'done'
  const argStr = formatArgs(call.args)

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 border text-xs"
      style={{ background: config.bg, borderColor: config.color + '30' }}
    >
      {/* Icon */}
      <div
        className="mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0"
        style={{ background: config.color + '18' }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold" style={{ color: config.color }}>
          {config.label}
        </p>
        {argStr && (
          <p className="text-[#6B7280] mt-0.5 truncate">{argStr}</p>
        )}
        <AnimatePresence>
          {isDone && call.result !== null && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.15 }}
              className="mt-1 text-[#374151] leading-snug"
            >
              {formatResult(call.name, call.result)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Status */}
      <div className="mt-0.5 shrink-0">
        {isDone
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          : <Loader2 className="w-4 h-4 animate-spin" style={{ color: config.color }} />
        }
      </div>
    </motion.div>
  )
}
