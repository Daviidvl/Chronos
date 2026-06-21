import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LEVELS, XP_REWARDS } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: ptBR })
}

export function formatTime(time: string) {
  return time.slice(0, 5)
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function friendlyDate(dateStr: string) {
  const d = parseISO(dateStr)
  if (isToday(d)) return 'Hoje'
  if (isYesterday(d)) return 'Ontem'
  return formatDate(dateStr, "dd 'de' MMMM")
}

export function getDayOfWeek(dateStr: string) {
  return format(parseISO(dateStr), 'EEEE', { locale: ptBR })
}

export function getWeekDays(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function getMonthDays(date = new Date()) {
  return eachDayOfInterval({ start: startOfMonth(date), end: endOfMonth(date) })
}

export function daysBetween(a: string, b: string) {
  return Math.abs(differenceInDays(parseISO(a), parseISO(b)))
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function calculateLevel(xp: number) {
  let currentLevel = LEVELS[0]
  let nextLevel = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i]
      nextLevel = LEVELS[Math.min(i + 1, LEVELS.length - 1)]
      break
    }
  }
  const xpInLevel = xp - currentLevel.xpRequired
  const xpForLevel = nextLevel.xpRequired - currentLevel.xpRequired
  const progress = xpForLevel > 0 ? Math.round((xpInLevel / xpForLevel) * 100) : 100
  return { ...currentLevel, nextLevel, xpToNext: nextLevel.xpRequired - xp, progress }
}

export function getHeatmapColor(count: number, max = 5) {
  if (count === 0) return 'rgba(255,255,255,0.06)'
  const intensity = Math.min(count / max, 1)
  const alpha = 0.2 + intensity * 0.8
  return `rgba(94, 106, 210, ${alpha})`
}

export function getStreakEmoji(streak: number) {
  if (streak >= 100) return '🏆'
  if (streak >= 30) return '🔥'
  if (streak >= 7) return '⚡'
  if (streak >= 3) return '✨'
  return '📍'
}

export function getProgressColor(pct: number) {
  if (pct >= 80) return '#10B981'
  if (pct >= 50) return '#F59E0B'
  return '#5E6AD2'
}

export function getMoodEmoji(mood: string) {
  const map: Record<string, string> = {
    great: '😄',
    good: '😊',
    okay: '😐',
    bad: '😞',
    terrible: '😢',
  }
  return map[mood] ?? '😐'
}

export function getMoodLabel(mood: string) {
  const map: Record<string, string> = {
    great: 'Ótimo',
    good: 'Bem',
    okay: 'Normal',
    bad: 'Mal',
    terrible: 'Péssimo',
  }
  return map[mood] ?? 'Normal'
}

export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function formatXP(xp: number) {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`
  return xp.toString()
}

export function getPriorityColor(priority: string) {
  const map: Record<string, string> = {
    urgent: '#EF4444',
    high: '#F59E0B',
    medium: '#5E6AD2',
    low: '#8A8F98',
  }
  return map[priority] ?? '#8A8F98'
}

export function getPriorityLabel(priority: string) {
  const map: Record<string, string> = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Média',
    low: 'Baixa',
  }
  return map[priority] ?? priority
}

export function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    health: 'Saúde',
    fitness: 'Exercício',
    mind: 'Mente',
    productivity: 'Produtividade',
    work: 'Trabalho',
    social: 'Social',
    finance: 'Finanças',
    spirituality: 'Espiritualidade',
    study: 'Estudos',
    relationships: 'Relacionamentos',
    personal: 'Pessoal',
    leisure: 'Lazer',
    other: 'Outro',
  }
  return map[category] ?? category
}

export function getFrequencyLabel(freq: string) {
  const map: Record<string, string> = {
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
  }
  return map[freq] ?? freq
}

export function last7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(format(d, 'yyyy-MM-dd'))
  }
  return days
}

export function getLast365Days() {
  const days = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(format(d, 'yyyy-MM-dd'))
  }
  return days
}
