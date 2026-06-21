export function curatorCompactCount(value: number): string {
  if (value >= 1_000_000) {
    const scaled = value / 1_000_000
    return `${scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1)}M`
  }
  if (value >= 1_000) {
    const scaled = value / 1_000
    return `${scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1)}K`
  }
  return value.toLocaleString()
}

export function curatorGrowthLabel(value: number): string {
  return `+${value}%`
}

export function curatorShortDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

export function curatorMonthYear(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(new Date(iso))
}

export function curatorActivityDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso))
}
