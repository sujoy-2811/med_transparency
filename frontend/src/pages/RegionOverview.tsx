import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Globe, MapPin } from 'lucide-react'
import { regionsApi } from '../api/regions'
import { Spinner } from '../components/ui/Spinner'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useSearchStore } from '../store/searchStore'

export function RegionOverview() {
  const navigate = useNavigate()
  const { setFilters } = useSearchStore()
  const { data: regions = [], isLoading } = useQuery({ queryKey: ['regions'], queryFn: regionsApi.list })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-5 h-5 text-[#1B4965]" />
          <h1 className="font-heading font-extrabold text-[#1B4965] text-2xl">Regions & Countries</h1>
        </div>
        <p className="text-[#6B7280]">Explore healthcare systems and top-rated facilities by country</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {regions.map(region => (
          <Card key={region.id} hover className="p-5 cursor-pointer" onClick={() => { setFilters({ region: region.id }); navigate('/search') }}>
            <div className="text-4xl mb-3">{region.flag_emoji}</div>
            <h3 className="font-heading font-bold text-[#1B4965] text-base mb-1">{region.name}</h3>
            <p className="text-xs text-[#6B7280] font-heading font-medium uppercase tracking-wide mb-3">{region.country_code}</p>
            {region.healthcare_summary && (
              <p className="text-sm text-[#4B5563] leading-relaxed line-clamp-3 mb-4" style={{ fontFamily: 'Lora, serif' }}>
                {region.healthcare_summary}
              </p>
            )}
            <Button size="sm" variant="ghost" className="w-full" onClick={e => { e.stopPropagation(); setFilters({ region: region.id }); navigate('/search') }} icon={<MapPin className="w-3.5 h-3.5" />}>
              View facilities
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
