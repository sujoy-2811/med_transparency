import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { Landing } from './pages/Landing'
import { Search } from './pages/Search'
import { ProcedureDetail } from './pages/ProcedureDetail'
import { AIConsultation } from './pages/AIConsultation'
import { Contribute } from './pages/Contribute'
import { Profile } from './pages/Profile'
import { RegionOverview } from './pages/RegionOverview'
import { About } from './pages/About'
import { Settings } from './pages/Settings'
import { Login } from './pages/Login'
import { Register } from './pages/Register'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/search" element={<Search />} />
            <Route path="/procedure/:slug" element={<ProcedureDetail />} />
            <Route path="/ai" element={<AIConsultation />} />
            <Route path="/contribute" element={<Contribute />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/regions" element={<RegionOverview />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
