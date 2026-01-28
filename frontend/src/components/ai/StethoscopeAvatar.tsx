import { Stethoscope } from 'lucide-react'

export function StethoscopeAvatar({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const icon = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'
  return (
    <div className={`${s} rounded-full bg-[#1B4965] flex items-center justify-center shrink-0`}>
      <Stethoscope className={`${icon} text-white`} />
    </div>
  )
}
