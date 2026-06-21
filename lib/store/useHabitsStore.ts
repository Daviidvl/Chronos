import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Habit, HabitLog, HabitStats } from '@/types'
import { generateId, todayISO, last7Days } from '@/lib/utils'
import { format, parseISO, differenceInDays, subDays } from 'date-fns'

interface HabitsState {
  habits: Habit[]
  logs: HabitLog[]
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  archiveHabit: (id: string) => void
  deleteHabit: (id: string) => void
  toggleHabit: (habitId: string, date?: string) => void
  skipHabit: (habitId: string, date?: string) => void
  addNote: (habitId: string, note: string, date?: string) => void
  getStats: (habitId: string) => HabitStats
  getTodayLogs: () => HabitLog[]
  getLogForDate: (habitId: string, date: string) => HabitLog | undefined
  getHabitHistory: (habitId: string, days?: number) => { date: string; completed: boolean }[]
  getActiveHabits: () => Habit[]
}

function computeStreak(logs: HabitLog[], habitId: string): { current: number; best: number } {
  const completed = logs
    .filter(l => l.habitId === habitId && l.completed)
    .map(l => l.date)
    .sort()
    .reverse()

  if (!completed.length) return { current: 0, best: 0 }

  let current = 0
  let best = 0
  let temp = 0
  const today = todayISO()

  // Current streak
  let checkDate = today
  for (const date of completed) {
    if (date === checkDate) {
      current++
      const prev = new Date(checkDate)
      prev.setDate(prev.getDate() - 1)
      checkDate = format(prev, 'yyyy-MM-dd')
    } else {
      break
    }
  }

  // Best streak
  const sorted = [...completed].sort()
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) {
      temp = 1
    } else {
      const prev = parseISO(sorted[i - 1])
      const curr = parseISO(sorted[i])
      if (differenceInDays(curr, prev) === 1) {
        temp++
      } else {
        best = Math.max(best, temp)
        temp = 1
      }
    }
  }
  best = Math.max(best, temp, current)

  return { current, best }
}

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: [
        {
          id: 'h1',
          name: 'Exercício',
          category: 'fitness',
          frequency: 'daily',
          targetPerWeek: 5,
          icon: '💪',
          color: '#F59E0B',
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          archived: false,
        },
        {
          id: 'h2',
          name: 'Leitura',
          category: 'mind',
          frequency: 'daily',
          targetPerWeek: 7,
          icon: '📚',
          color: '#8B5CF6',
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          archived: false,
        },
        {
          id: 'h3',
          name: 'Meditação',
          category: 'mind',
          frequency: 'daily',
          targetPerWeek: 7,
          icon: '🧘',
          color: '#A78BFA',
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          archived: false,
        },
        {
          id: 'h4',
          name: 'Dormir cedo',
          category: 'health',
          frequency: 'daily',
          targetPerWeek: 7,
          icon: '😴',
          color: '#10B981',
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          archived: false,
        },
      ],
      logs: (() => {
        // Generate some seed data
        const seedLogs: HabitLog[] = []
        const habits = ['h1', 'h2', 'h3', 'h4']
        for (let i = 30; i >= 1; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const date = format(d, 'yyyy-MM-dd')
          habits.forEach(hId => {
            const shouldComplete = Math.random() > (hId === 'h1' ? 0.25 : 0.2)
            if (shouldComplete) {
              seedLogs.push({
                id: generateId(),
                habitId: hId,
                date,
                completed: true,
                skipped: false,
              })
            }
          })
        }
        return seedLogs
      })(),

      addHabit: (habit) => {
        const newHabit: Habit = {
          ...habit,
          id: generateId(),
          createdAt: new Date().toISOString(),
          archived: false,
        }
        set(s => ({ habits: [...s.habits, newHabit] }))
      },

      updateHabit: (id, updates) => {
        set(s => ({ habits: s.habits.map(h => h.id === id ? { ...h, ...updates } : h) }))
      },

      archiveHabit: (id) => {
        set(s => ({ habits: s.habits.map(h => h.id === id ? { ...h, archived: true } : h) }))
      },

      deleteHabit: (id) => {
        set(s => ({
          habits: s.habits.filter(h => h.id !== id),
          logs: s.logs.filter(l => l.habitId !== id),
        }))
      },

      toggleHabit: (habitId, date = todayISO()) => {
        const logs = get().logs
        const existing = logs.find(l => l.habitId === habitId && l.date === date)
        if (existing) {
          set(s => ({
            logs: s.logs.map(l =>
              l.id === existing.id ? { ...l, completed: !l.completed, skipped: false } : l
            ),
          }))
        } else {
          set(s => ({
            logs: [...s.logs, {
              id: generateId(),
              habitId,
              date,
              completed: true,
              skipped: false,
            }],
          }))
        }
      },

      skipHabit: (habitId, date = todayISO()) => {
        const logs = get().logs
        const existing = logs.find(l => l.habitId === habitId && l.date === date)
        if (existing) {
          set(s => ({
            logs: s.logs.map(l =>
              l.id === existing.id ? { ...l, skipped: true, completed: false } : l
            ),
          }))
        } else {
          set(s => ({
            logs: [...s.logs, {
              id: generateId(),
              habitId,
              date,
              completed: false,
              skipped: true,
            }],
          }))
        }
      },

      addNote: (habitId, note, date = todayISO()) => {
        const logs = get().logs
        const existing = logs.find(l => l.habitId === habitId && l.date === date)
        if (existing) {
          set(s => ({
            logs: s.logs.map(l => l.id === existing.id ? { ...l, note } : l),
          }))
        }
      },

      getStats: (habitId) => {
        const logs = get().logs
        const { current, best } = computeStreak(logs, habitId)
        const completed = logs.filter(l => l.habitId === habitId && l.completed)
        const last30 = completed.filter(l => {
          const d = parseISO(l.date)
          return differenceInDays(new Date(), d) <= 30
        })
        const weekDays = last7Days()
        const weekCompleted = completed.filter(l => weekDays.includes(l.date)).length

        return {
          habitId,
          currentStreak: current,
          bestStreak: best,
          completionRate: last30.length > 0 ? Math.round((last30.length / 30) * 100) : 0,
          totalCompleted: completed.length,
          weeklyCompleted: weekCompleted,
        }
      },

      getTodayLogs: () => {
        const today = todayISO()
        return get().logs.filter(l => l.date === today)
      },

      getLogForDate: (habitId, date) => {
        return get().logs.find(l => l.habitId === habitId && l.date === date)
      },

      getHabitHistory: (habitId, days = 30) => {
        const logs = get().logs
        const history = []
        for (let i = days - 1; i >= 0; i--) {
          const d = subDays(new Date(), i)
          const date = format(d, 'yyyy-MM-dd')
          const log = logs.find(l => l.habitId === habitId && l.date === date)
          history.push({ date, completed: log?.completed ?? false })
        }
        return history
      },

      getActiveHabits: () => {
        return get().habits.filter(h => !h.archived)
      },
    }),
    { name: 'chronos-habits' }
  )
)
