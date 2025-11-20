import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Shield, Database, Globe, ArrowRight, TrendingDown, Clock, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { proceduresApi } from '../api/procedures'
import { useSearchStore } from '../store/searchStore'
import { Button } from '../components/ui/Button'

const CATEGORIES = [
  { icon: '🦴', label: 'Orthopaedics', slug: 'knee-replacement' },
  { icon: '❤️', label: 'Cardiac', slug: 'coronary-bypass' },
  { icon: '👁️', label: 'Ophthalmology', slug: 'lasik' },
  { icon: '🦷', label: 'Dentistry', slug: 'dental-implants' },
  { icon: '✨', label: 'Cosmetic', slug: 'rhinoplasty' },
  { icon: '🧬', label: 'Fertility', slug: 'ivf-treatment' },
]

export function Landing() {
  const navigate = useNavigate()
  const { setFilters } = useSearchStore()
  const [query, setQuery] = useState('')

  const { data: suggestions = [] } = useQuery({
    queryKey: ['autocomplete', query],
    queryFn: () => proceduresApi.autocomplete(query),
    enabled: query.length >= 2,
  })

  const handleSearch = () => {
    if (query.length >= 2) navigate(`/search`)
  }

  const handleProcedureClick = (slug: string) => {
    setFilters({ procedure: slug })
    navigate('/search')
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B4965] to-[#2a6a96] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm mb-6">
              <Database className="w-3.5 h-3.5" />
              <span className="font-heading">Crowdsourced from real patients worldwide</span>
            </div>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-5">
              Know the real cost of<br /><span className="text-[#5FA8D3]">your procedure</span>
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8" style={{ fontFamily: 'Lora, serif' }}>
              Compare verified procedure costs, wait times, and patient outcomes across hospitals and countries. Make informed decisions — whether at home or abroad.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="relative max-w-xl mx-auto">
            <div className="flex bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="flex-1 flex items-center px-4 gap-2">
                <Search className="w-5 h-5 text-[#6B7280] shrink-0" />
                <input
                  className="flex-1 py-4 text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none font-body text-base"
                  placeholder="Search procedure, e.g. Hip Replacement..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button className="m-2 rounded-lg" size="lg" onClick={handleSearch}>Search</Button>
            </div>
            {suggestions.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden">
                {suggestions.map(p => (
                  <button key={p.id} onClick={() => handleProcedureClick(p.slug)}
                    className="w-full px-5 py-3 text-left text-sm hover:bg-[#F8F9FA] flex items-center gap-3">
                    <span className="font-heading font-semibold text-[#1B4965]">{p.name}</span>
                    <span className="text-[#6B7280] text-xs">{p.category}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="bg-[#F8F9FA] border-b border-[#E5E7EB] py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[['12,400+', 'Data Points', Database], ['48', 'Countries', Globe], ['98%', 'Anonymised', Shield], ['4.8★', 'Avg Outcome', Star]].map(([val, label, Icon]: any) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-[#1B4965] mb-1">
                <Icon className="w-4 h-4" />
                <span className="font-heading font-extrabold text-xl">{val}</span>
              </div>
              <p className="text-xs text-[#6B7280] font-heading">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h2 className="font-heading font-bold text-[#1B4965] text-2xl mb-1">Browse by specialty</h2>
          <p className="text-[#6B7280]">Find cost data for your specific procedure category</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(c => (
            <button key={c.slug} onClick={() => handleProcedureClick(c.slug)}
              className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center hover:border-[#1B4965]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="font-heading font-semibold text-sm text-[#1B4965]">{c.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#1B4965]/5 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-[#1B4965] text-2xl text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Search, step: '01', title: 'Search your procedure', desc: 'Find your procedure and set filters for budget, region, and wait time preferences.' },
              { icon: TrendingDown, step: '02', title: 'Compare ranked options', desc: 'Review verified cost ranges, outcome scores, and patient testimonials side-by-side.' },
              { icon: Clock, step: '03', title: 'Make an informed decision', desc: 'Use our AI advisor for personalised recommendations tailored to your situation.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-[#1B4965] rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-heading font-bold text-[#5FA8D3] mb-1">{item.step}</div>
                <h3 className="font-heading font-bold text-[#1B4965] mb-2">{item.title}</h3>
                <p className="text-sm text-[#6B7280]" style={{ fontFamily: 'Lora, serif' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button size="lg" onClick={() => navigate('/search')} icon={<ArrowRight className="w-5 h-5" />}>
              Start comparing
            </Button>
          </div>
        </div>
      </section>

      {/* CTA contribute */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#1B4965] to-[#2a6a96] rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl mb-3">Had a procedure recently?</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-6" style={{ fontFamily: 'Lora, serif' }}>
            Share your experience — anonymously — and help thousands of patients make better decisions. Your data point matters.
          </p>
          <Button variant="amber" size="lg" onClick={() => navigate('/contribute')} icon={<ArrowRight className="w-5 h-5" />}>
            Contribute your data
          </Button>
        </div>
      </section>
    </div>
  )
}
