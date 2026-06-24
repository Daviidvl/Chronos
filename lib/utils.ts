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

export const REVIEW_INTERVALS = [1, 3, 7, 15, 30]

export function nextReviewInterval(current: number | null): number {
  if (!current) return 1
  const idx = REVIEW_INTERVALS.indexOf(current)
  return idx === -1 || idx === REVIEW_INTERVALS.length - 1
    ? 30
    : REVIEW_INTERVALS[idx + 1]
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

export function formatTime(time: string | null): string {
  if (!time) return ''
  return time.slice(0, 5)
}

export function timeRange(start: string | null, end: string | null): string {
  if (!start) return ''
  if (!end) return formatTime(start)
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function last7Days(): string[] {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(format(d, 'yyyy-MM-dd'))
  }
  return days
}

export function getWeekDays(date: Date): Date[] {
  const day = date.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  const monday = new Date(date)
  monday.setDate(date.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export const DEFAULT_CATEGORIES = [
  { name: 'Acordar',  color: '#F59E0B' },
  { name: 'Leitura',  color: '#3B82F6' },
  { name: 'Treino',   color: '#10B981' },
  { name: 'Trabalho', color: '#EF4444' },
  { name: 'Estudo',   color: '#8B5CF6' },
  { name: 'Pessoal',  color: '#EC4899' },
]
