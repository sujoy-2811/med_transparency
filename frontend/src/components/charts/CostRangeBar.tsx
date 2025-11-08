import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatUSD } from '../../utils/formatCurrency'

interface Props {
  min: number
  avg: number
  max: number
  label?: string
}

export function CostRangeBar({ min, avg, max, label }: Props) {
  const data = [
    { name: 'Min', value: min, fill: '#84BFE0' },
    { name: 'Avg', value: avg, fill: '#1B4965' },
    { name: 'Max', value: max, fill: '#5FA8D3' },
  ]
  return (
    <div>
      {label && <p className="text-xs font-heading font-semibold text-[#6B7280] uppercase tracking-wide mb-2">{label}</p>}
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={data} barCategoryGap="20%">
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280', fontFamily: 'Libre Franklin' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip formatter={(v) => formatUSD(v as number)} contentStyle={{ fontFamily: 'Libre Franklin', fontSize: 12 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
