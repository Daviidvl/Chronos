import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDate(date: Date): string {
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  if (isTomorrow(date)) return 'Amanhã'
  return format(date, "EEE, dd 'de' MMM", { locale: ptBR })
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
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
