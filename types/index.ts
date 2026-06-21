export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'mind'
  | 'productivity'
  | 'social'
  | 'finance'
  | 'spirituality'

export type HabitFrequency = 'daily' | 'weekly' | 'monthly'

export interface Habit {
  id: string
  name: string
  category: HabitCategory
  frequency: HabitFrequency
  targetPerWeek: number
  icon: string
  color: string
  createdAt: string
  archived: boolean
}

export interface HabitLog {
  id: string
  habitId: string
  date: string // ISO date YYYY-MM-DD
  completed: boolean
  skipped: boolean
  note?: string
}

export interface HabitStats {
  habitId: string
  currentStreak: number
  bestStreak: number
  completionRate: number
  totalCompleted: number
  weeklyCompleted: number
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskCategory =
  | 'health'
  | 'work'
  | 'study'
  | 'finance'
  | 'personal'
  | 'other'

export interface Task {
  id: string
  title: string
  description?: string
  priority: TaskPriority
  category: TaskCategory
  dueDate?: string
  completed: boolean
  completedAt?: string
  important: boolean
  order: number
  createdAt: string
}

export type GoalCategory =
  | 'health'
  | 'work'
  | 'study'
  | 'finance'
  | 'relationships'
  | 'spirituality'

export type GoalPriority = 'low' | 'medium' | 'high'

export interface GoalMilestone {
  id: string
  goalId: string
  title: string
  completed: boolean
  order: number
}

export interface Goal {
  id: string
  title: string
  description?: string
  category: GoalCategory
  priority: GoalPriority
  deadline?: string
  progress: number
  habitIds: string[]
  milestones: GoalMilestone[]
  notes?: string
  createdAt: string
  archived: boolean
}

export type EventCategory =
  | 'work'
  | 'health'
  | 'study'
  | 'leisure'
  | 'personal'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string // HH:MM
  endTime?: string  // HH:MM
  date: string      // YYYY-MM-DD
  category: EventCategory
  color?: string
  allDay: boolean
}

export type JournalMood = 'great' | 'good' | 'okay' | 'bad' | 'terrible'

export interface JournalEntry {
  id: string
  date: string // YYYY-MM-DD
  content: string
  mood?: JournalMood
  gratitude?: string
  reflection?: string
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  unlockedAt?: string
}

export interface UserProfile {
  id: string
  name: string
  avatar?: string
  level: number
  xp: number
  xpToNextLevel: number
  achievements: string[]
  createdAt: string
}

export interface DayStats {
  date: string
  tasksCompleted: number
  tasksTotal: number
  habitsCompleted: number
  habitsTotal: number
  productiveHours: number
  journalWritten: boolean
}

export type ViewMode = 'day' | 'week' | 'month'

export interface InsightItem {
  id: string
  title: string
  description: string
  type: 'habit' | 'productivity' | 'goal' | 'streak'
  value?: number | string
  icon: string
}

export const CATEGORY_COLORS: Record<string, string> = {
  health: '#10B981',
  fitness: '#F59E0B',
  mind: '#8B5CF6',
  productivity: '#5E6AD2',
  work: '#5E6AD2',
  social: '#EC4899',
  finance: '#06B6D4',
  spirituality: '#A78BFA',
  study: '#F59E0B',
  relationships: '#EC4899',
  personal: '#8A8F98',
  leisure: '#10B981',
  other: '#8A8F98',
}

export const CATEGORY_ICONS: Record<string, string> = {
  health: '🏥',
  fitness: '💪',
  mind: '🧠',
  productivity: '⚡',
  work: '💼',
  social: '👥',
  finance: '💰',
  spirituality: '🙏',
  study: '📚',
  relationships: '❤️',
  personal: '✨',
  leisure: '🎮',
  other: '📌',
}

export const XP_REWARDS = {
  completeTask: 10,
  completeHabit: 15,
  completeMilestone: 25,
  completeGoal: 100,
  writeJournal: 20,
  streak7: 50,
  streak30: 200,
  streak100: 500,
  perfectDay: 75,
}

export const LEVELS = [
  { level: 1, xpRequired: 0, title: 'Iniciante' },
  { level: 2, xpRequired: 100, title: 'Aprendiz' },
  { level: 3, xpRequired: 250, title: 'Praticante' },
  { level: 4, xpRequired: 500, title: 'Consistente' },
  { level: 5, xpRequired: 1000, title: 'Dedicado' },
  { level: 6, xpRequired: 2000, title: 'Focado' },
  { level: 7, xpRequired: 3500, title: 'Disciplinado' },
  { level: 8, xpRequired: 5000, title: 'Mestre' },
  { level: 9, xpRequired: 7500, title: 'Elite' },
  { level: 10, xpRequired: 10000, title: 'Lendário' },
]
