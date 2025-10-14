import { Link } from 'react-router-dom'
import { Activity, Shield, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#1B4965] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-lg">MedTransparency</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Crowdsourced healthcare cost data helping patients make informed decisions about medical procedures worldwide.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-white/50">
              <Shield className="w-3 h-3" /> All data is anonymised and aggregated
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {[['/', 'Home'], ['/search', 'Compare Costs'], ['/regions', 'Regions'], ['/ai', 'AI Advisor'], ['/contribute', 'Contribute Data']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3">Information</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {[['/about', 'About & Methodology'], ['/about#verification', 'Data Verification'], ['/about#privacy', 'Privacy Policy']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">© 2026 MedTransparency. Not medical advice. Always consult a qualified physician.</p>
          <div className="flex items-center gap-1 text-xs text-white/50">
            Made with <Heart className="w-3 h-3 text-red-400 mx-0.5" /> for patients worldwide
          </div>
        </div>
      </div>
    </footer>
  )
}
