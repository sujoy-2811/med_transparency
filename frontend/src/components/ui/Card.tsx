interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hover, onClick }: CardProps) {
  return (
    <div onClick={onClick} className={`bg-white rounded-xl border border-[#E5E7EB] shadow-sm ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  )
}
