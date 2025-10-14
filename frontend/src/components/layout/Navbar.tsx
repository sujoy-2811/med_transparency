import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Activity, Menu, X, User, LogOut, PlusCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { to: '/search', label: 'Compare Costs' },
  { to: '/regions', label: 'Regions' },
  { to: '/ai', label: 'AI Advisor' },
  { to: '/contribute', label: 'Contribute Data' },
  { to: '/about', label: 'About' },
]

export function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#1B4965] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-bold text-[#1B4965] text-lg">MedTransparency</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-heading font-medium transition-colors ${isActive ? 'text-[#1B4965] bg-[#1B4965]/8' : 'text-[#6B7280] hover:text-[#1B4965] hover:bg-[#1B4965]/5'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} icon={<User className="w-4 h-4" />}>{user.display_name}</Button>
              <Button variant="ghost" size="sm" onClick={logout} icon={<LogOut className="w-4 h-4" />}>Sign out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
              <Button size="sm" onClick={() => navigate('/register')} icon={<PlusCircle className="w-4 h-4" />}>Get started</Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2 rounded-lg text-[#1B4965]" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-[#E5E7EB] overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(l => (
                <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `px-3 py-2.5 rounded-lg text-sm font-heading font-medium ${isActive ? 'bg-[#1B4965]/10 text-[#1B4965]' : 'text-[#6B7280]'}`}>
                  {l.label}
                </NavLink>
              ))}
              <div className="pt-2 border-t border-[#E5E7EB] flex gap-2">
                {user ? (
                  <Button variant="ghost" size="sm" onClick={() => { logout(); setMobileOpen(false) }}>Sign out</Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => { navigate('/login'); setMobileOpen(false) }}>Sign in</Button>
                    <Button size="sm" onClick={() => { navigate('/register'); setMobileOpen(false) }}>Get started</Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
