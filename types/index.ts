export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Category = 'saude' | 'trabalho' | 'estudos' | 'pessoal' | 'financas' | 'relacionamentos' | 'lazer'

export const CATEGORY_COLORS: Record<Category, string> = {
  saude:          '#22C55E',
  trabalho:       '#6366F1',
  estudos:        '#3B82F6',
  pessoal:        '#EC4899',
  financas:       '#F59E0B',
  relacionamentos:'#8B5CF6',
  lazer:          '#14B8A6',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  saude:          'Saúde',
  trabalho:       'Trabalho',
  estudos:        'Estudos',
  pessoal:        'Pessoal',
  financas:       'Finanças',
  relacionamentos:'Relacionamentos',
  lazer:          'Lazer',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low:    'rgba(255,255,255,0.30)',
  medium: '#6366F1',
  high:   '#F59E0B',
  urgent: '#EF4444',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low:    'Baixa',
  medium: 'Média',
  high:   'Alta',
  urgent: 'Urgente',
}

export interface Habit {
  id: string
  name: string
  category: Category
  color: string
  frequency: 'daily' | 'weekly'
  targetDays: number
  createdAt: string
  archived: boolean
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
  note?: string
}

export interface HabitStats {
  currentStreak: number
  bestStreak: number
  completionRate: number
  totalCompleted: number
}

export interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  category: Category
  dueDate?: string
  completed: boolean
  completedAt?: string
  important: boolean
  order: number
  createdAt: string
}

export interface GoalMilestone {
  id: string
  title: string
  completed: boolean
}

export interface Goal {
  id: string
  title: string
  description?: string
  category: Category
  priority: Priority
  deadline?: string
  progress: number
  milestones: GoalMilestone[]
  archived: boolean
  createdAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime?: string
  category: Category
  allDay: boolean
  description?: string
}

export interface UserProfile {
  id: string
  name: string
  avatar?: string
}
