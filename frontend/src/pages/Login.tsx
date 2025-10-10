import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Activity } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type FormData = z.infer<typeof schema>

export function Login() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (d: FormData) => authApi.login(d.email, d.password),
    onSuccess: async (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token)
      const user = await authApi.me()
      setUser(user)
      navigate('/profile')
    },
  })

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1B4965] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-heading font-extrabold text-[#1B4965] text-2xl">Sign in</h1>
          <p className="text-[#6B7280] mt-1">Welcome back to MedTransparency</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
            {mutation.isError && <p className="text-sm text-red-500">Invalid email or password</p>}
            <Button type="submit" className="w-full" loading={mutation.isPending}>Sign in</Button>
          </form>
          <p className="text-center text-sm text-[#6B7280] mt-4">
            No account? <Link to="/register" className="text-[#1B4965] font-heading font-semibold hover:underline">Sign up free</Link>
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
            Demo: <strong>demo@medtransparency.app</strong> / <strong>Demo1234!</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
