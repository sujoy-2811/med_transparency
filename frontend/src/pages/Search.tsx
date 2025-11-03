import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { useSearchStore } from '../store/searchStore'
import { searchApi } from '../api/search'
import { ResultCard } from '../components/search/ResultCard'
import { FilterPanel } from '../components/search/FilterPanel'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'

export function Search() {
  const { filters, triggerCount, triggerSearch } = useSearchStore()
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['search', filters, triggerCount],
    queryFn: () => searchApi.search(filters),
    enabled: triggerCount > 0 || !!(filters.procedure || filters.region),
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-heading font-extrabold text-[#1B4965] text-2xl sm:text-3xl">Compare Procedure Costs</h1>
        <p className="text-[#6B7280] mt-1">Filter, rank, and compare verified patient data from worldwide</p>
      </div>

      <div className="lg:grid lg:grid-cols-[300px,1fr] gap-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel onSearch={() => triggerSearch()} />
          </div>
        </div>

        {/* Mobile filter button */}
        <div className="lg:hidden mb-4">
          <Button variant="ghost" onClick={() => setShowMobileFilter(true)} icon={<SlidersHorizontal className="w-4 h-4" />}>
            Filters & Sort
          </Button>
        </div>

        {/* Mobile filter sheet */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowMobileFilter(false)}>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-4"
              onClick={e => e.stopPropagation()}
            >
              <FilterPanel onSearch={() => { triggerSearch(); setShowMobileFilter(false) }} onCloseMobile={() => setShowMobileFilter(false)} />
            </motion.div>
          </div>
        )}

        {/* Results */}
        <div>
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Spinner size="lg" className="mx-auto mb-3" />
                <p className="text-[#6B7280] font-heading">Searching and ranking results...</p>
              </div>
            </div>
          )}

          {isError && (
            <div className="text-center py-20 text-red-500">
              <p className="font-heading font-semibold">Failed to load results. Is the backend running?</p>
            </div>
          )}

          {data && data.results.length === 0 && (
            <div className="text-center py-20">
              <p className="font-heading font-semibold text-[#1B4965] text-lg mb-2">No results found</p>
              <p className="text-[#6B7280]">Try adjusting your filters or searching a different procedure</p>
            </div>
          )}

          {data && data.results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[#6B7280] font-heading">
                  <span className="font-bold text-[#1B4965]">{data.total}</span> options found
                  {data.procedure_name && <> for <span className="font-semibold">{data.procedure_name}</span></>}
                </p>
              </div>
              <div className="space-y-4">
                {data.results.map((result, i) => (
                  <ResultCard key={`${result.hospital.id}-${result.procedure.id}`} result={result} rank={i} />
                ))}
              </div>
            </div>
          )}

          {!data && !isLoading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="font-heading font-semibold text-[#1B4965] text-lg mb-2">Search for a procedure</p>
              <p className="text-[#6B7280]">Use the filters to find and compare costs across hospitals and countries</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
