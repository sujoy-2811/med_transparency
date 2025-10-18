export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-4' }[size]
  return (
    <span className={`inline-block rounded-full border-[#1B4965] border-t-transparent animate-spin ${s} ${className}`} />
  )
}
