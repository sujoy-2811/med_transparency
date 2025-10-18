type BadgeVariant = 'primary' | 'secondary' | 'amber' | 'success' | 'muted' | 'green'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-[#1B4965]/10 text-[#1B4965]',
  secondary: 'bg-[#5FA8D3]/15 text-[#2a6a96]',
  amber: 'bg-[#E8A838]/15 text-[#b07b1a]',
  success: 'bg-green-100 text-green-700',
  muted: 'bg-gray-100 text-gray-600',
  green: 'bg-emerald-100 text-emerald-700',
}

export function Badge({ children, variant = 'muted', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-heading font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
