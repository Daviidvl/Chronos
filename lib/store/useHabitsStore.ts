import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Habit, HabitLog, HabitStats } from '@/types'
import { generateId, todayISO, computeHabitStats } from '@/lib/utils'

interface HabitsState {
  habits: Habit[]
  logs: HabitLog[]
  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  updateHabit: (id: string, u: Partial<Habit>) => void
  archiveHabit: (id: string) => void
  deleteHabit: (id: string) => void
  toggleHabit: (habitId: string, date?: string) => void
  getStats: (habitId: string) => HabitStats
  getLogForDate: (habitId: string, date: string) => HabitLog | undefined
  getActiveHabits: () => Habit[]
}

const TODAY = todayISO()

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: [
        { id: 'h1', name: 'Exercício', category: 'saude',    color: '#22C55E', frequency: 'daily', targetDays: 7, createdAt: TODAY, archived: false },
        { id: 'h2', name: 'Leitura',   category: 'estudos',  color: '#3B82F6', frequency: 'daily', targetDays: 7, createdAt: TODAY, archived: false },
        { id: 'h3', name: 'Meditação', category: 'pessoal',  color: '#EC4899', frequency: 'daily', targetDays: 7, createdAt: TODAY, archived: false },
        { id: 'h4', name: 'Diário',    category: 'pessoal',  color: '#EC4899', frequency: 'daily', targetDays: 7, createdAt: TODAY, archived: false },
      ],
      logs: [],

      addHabit: (h) => set(s => ({
        habits: [...s.habits, { ...h, id: generateId(), createdAt: TODAY, archived: false }]
      })),

      updateHabit: (id, u) => set(s => ({
        habits: s.habits.map(h => h.id === id ? { ...h, ...u } : h)
      })),

      archiveHabit: (id) => set(s => ({
        habits: s.habits.map(h => h.id === id ? { ...h, archived: true } : h)
      })),

      deleteHabit: (id) => set(s => ({
        habits: s.habits.filter(h => h.id !== id),
        logs: s.logs.filter(l => l.habitId !== id),
      })),

      toggleHabit: (habitId, date) => {
        const d = date ?? todayISO()
        const existing = get().logs.find(l => l.habitId === habitId && l.date === d)
        if (existing) {
          set(s => ({ logs: s.logs.map(l => l.id === existing.id ? { ...l, completed: !l.completed } : l) }))
        } else {
          set(s => ({ logs: [...s.logs, { id: generateId(), habitId, date: d, completed: true }] }))
        }
      },

      getStats: (habitId) => computeHabitStats(get().logs, habitId),

      getLogForDate: (habitId, date) => get().logs.find(l => l.habitId === habitId && l.date === date),

      getActiveHabits: () => get().habits.filter(h => !h.archived),
    }),
    { name: 'chronos-habits-v2' }
  )
)
