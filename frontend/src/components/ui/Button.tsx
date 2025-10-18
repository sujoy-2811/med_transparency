import { forwardRef } from 'react'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: React.ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#1B4965] text-white hover:bg-[#123347] focus:ring-[#1B4965]/40',
  secondary: 'bg-[#5FA8D3] text-white hover:bg-[#4a93be] focus:ring-[#5FA8D3]/40',
  ghost: 'bg-transparent text-[#1B4965] hover:bg-[#1B4965]/8 border border-[#1B4965]/20',
  danger: 'bg-[#EF4444] text-white hover:bg-red-600 focus:ring-red-400/40',
  amber: 'bg-[#E8A838] text-white hover:bg-[#d4962e] focus:ring-[#E8A838]/40',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 font-heading font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
    </motion.button>
  )
)
Button.displayName = 'Button'
