import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSearchStore } from '../../store/searchStore'
import { proceduresApi } from '../../api/procedures'
import { regionsApi } from '../../api/regions'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'

interface Props {
  onSearch: () => void
  onCloseMobile?: () => void
}

export function FilterPanel({ onSearch, onCloseMobile }: Props) {
  const { filters, setFilters, resetFilters } = useSearchStore()
  const [procQuery, setProcQuery] = useState(filters.procedure)

  const { data: procedures = [] } = useQuery({
    queryKey: ['autocomplete', procQuery],
    queryFn: () => proceduresApi.autocomplete(procQuery),
    enabled: procQuery.length >= 2,
  })

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: regionsApi.list,
  })

  const regionOptions = [{ value: '', label: 'All regions' }, ...regions.map(r => ({ value: r.id, label: `${r.flag_emoji} ${r.name}` }))]
  const sortOptions = [{ value: 'cost', label: 'Lowest cost' }, { value: 'outcome', label: 'Best outcome' }, { value: 'wait', label: 'Shortest wait' }]

  const panelClass = `bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-5`

  return (
    <div className={panelClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#1B4965]" />
          <span className="font-heading font-semibold text-[#1B4965]">Filters</span>
        </div>
        {onCloseMobile && <button onClick={onCloseMobile}><X className="w-4 h-4 text-[#6B7280]" /></button>}
      </div>

      <div className="relative">
        <label className="text-sm font-heading font-medium text-[#1B4965] block mb-1">Procedure</label>
        <Input
          placeholder="e.g. Hip Replacement"
          value={procQuery}
          onChange={e => setProcQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
        {procQuery.length >= 2 && procedures.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {procedures.map(p => (
              <button
                key={p.id}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-[#F8F9FA] flex items-center gap-2"
                onClick={() => { setFilters({ procedure: p.slug }); setProcQuery(p.name) }}
              >
                <span className="font-heading font-medium text-[#1B4965]">{p.name}</span>
                <span className="text-[#6B7280] text-xs">{p.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Select label="Region / Country" options={regionOptions} value={filters.region} onChange={e => setFilters({ region: e.target.value })} />

      <div>
        <label className="text-sm font-heading font-medium text-[#1B4965] block mb-2">Budget (USD)</label>
        <div className="flex gap-2">
          <Input placeholder="Min" type="number" value={filters.budget_min} onChange={e => setFilters({ budget_min: e.target.value })} />
          <Input placeholder="Max" type="number" value={filters.budget_max} onChange={e => setFilters({ budget_max: e.target.value })} />
        </div>
      </div>

      <Input
        label="Max Wait Days"
        type="number"
        placeholder="e.g. 30"
        value={filters.max_wait_days}
        onChange={e => setFilters({ max_wait_days: e.target.value })}
      />

      <Select label="Sort by" options={sortOptions} value={filters.sort_by} onChange={e => setFilters({ sort_by: e.target.value as any })} />

      <div className="flex gap-2 pt-1">
        <Button className="flex-1" onClick={onSearch} icon={<Search className="w-4 h-4" />}>Search</Button>
        <Button variant="ghost" onClick={() => { resetFilters(); setProcQuery('') }}>Reset</Button>
      </div>
    </div>
  )
}
