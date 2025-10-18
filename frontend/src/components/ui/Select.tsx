import { forwardRef } from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-heading font-medium text-[#1B4965]">{label}</label>}
      <select
        ref={ref}
        className={`w-full border border-[#E5E7EB] rounded-lg bg-white px-3 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1B4965]/30 focus:border-[#1B4965] transition ${className}`}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
