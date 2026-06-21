import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, differenceInDays, eachDayOfInterval, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { HabitLog, HabitStats } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd 'de' MMMM", { locale: ptBR })
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd/MM', { locale: ptBR })
}

export function formatDateTime(dateStr: string, time: string): string {
  return `${format(parseISO(dateStr), "EEE, dd MMM", { locale: ptBR })} · ${time}`
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function daysUntil(dateStr: string): number {
  return differenceInDays(parseISO(dateStr), new Date())
}

export function daysLabel(n: number): string {
  if (n < 0) return 'Venceu'
  if (n === 0) return 'Hoje'
  if (n === 1) return 'Amanhã'
  return `${n}d`
}

export function last7Days(): string[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) =>
    subDays(today, 6 - i).toISOString().slice(0, 10)
  )
}

export function last365Days(): string[] {
  const today = new Date()
  return Array.from({ length: 365 }, (_, i) =>
    subDays(today, 364 - i).toISOString().slice(0, 10)
  )
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function computeHabitStats(logs: HabitLog[], habitId: string): HabitStats {
  const completed = logs
    .filter(l => l.habitId === habitId && l.completed)
    .map(l => l.date)
    .sort()
    .reverse()

  let currentStreak = 0
  let bestStreak = 0
  let temp = 0
  const today = todayISO()
  const yesterday = subDays(new Date(), 1).toISOString().slice(0, 10)
  const set = new Set(completed)

  let check = set.has(today) ? today : (set.has(yesterday) ? yesterday : null)
  if (check) {
    let d = new Date(check)
    while (set.has(d.toISOString().slice(0, 10))) {
      currentStreak++
      d = subDays(d, 1)
    }
  }

  const allDays = completed.slice().reverse()
  for (let i = 0; i < allDays.length; i++) {
    if (i === 0) { temp = 1; continue }
    const diff = differenceInDays(parseISO(allDays[i]), parseISO(allDays[i - 1]))
    if (diff === 1) { temp++ } else { temp = 1 }
    if (temp > bestStreak) bestStreak = temp
  }
  if (temp > bestStreak) bestStreak = temp

  const last30 = Array.from({ length: 30 }, (_, i) =>
    subDays(new Date(), i).toISOString().slice(0, 10)
  )
  const totalLast30 = last30.filter(d => set.has(d)).length
  const completionRate = Math.round((totalLast30 / 30) * 100)

  return { currentStreak, bestStreak, completionRate, totalCompleted: completed.length }
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function formatDuration(startTime: string, endTime: string): string {
  const diff = timeToMinutes(endTime) - timeToMinutes(startTime)
  if (diff < 60) return `${diff}min`
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return m ? `${h}h${m}min` : `${h}h`
}
