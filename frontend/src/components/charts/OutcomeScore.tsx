interface Props {
  score: number
  maxScore?: number
  size?: 'sm' | 'md'
}

export function OutcomeScore({ score, maxScore = 10, size = 'md' }: Props) {
  const dots = maxScore
  const filled = Math.round((score / maxScore) * dots)
  const sz = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: dots }).map((_, i) => (
        <span
          key={i}
          className={`rounded-full ${sz} ${i < filled ? 'bg-[#1B4965]' : 'bg-[#E5E7EB]'}`}
        />
      ))}
      <span className="ml-1 text-xs font-heading font-semibold text-[#1B4965]">{score.toFixed(1)}</span>
    </div>
  )
}
