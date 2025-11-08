export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function formatRange(min: number, max: number): string {
  return `${formatUSD(min)} – ${formatUSD(max)}`
}
