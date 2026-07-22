import { format } from 'date-fns'

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}min`
}

export function calcStreak(completedDates: string[]): number {
  const unique = [...new Set(completedDates)].sort().reverse()
  let streak = 0
  for (let i = 0; i < 60; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = format(d, 'yyyy-MM-dd')
    if (unique.includes(iso)) {
      streak++
    } else {
      break
    }
  }
  return streak
}

