import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Goal, GoalMilestone } from '@/types'
import { generateId, todayISO } from '@/lib/utils'
import { addDays } from 'date-fns'

interface GoalsState {
  goals: Goal[]
  addGoal: (g: Omit<Goal, 'id' | 'createdAt' | 'archived' | 'milestones'>) => void
  updateGoal: (id: string, u: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void
  addMilestone: (goalId: string, title: string) => void
  getActiveGoals: () => Goal[]
}

const T = todayISO()
const d = (n: number) => addDays(new Date(), n).toISOString().slice(0, 10)

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [
        {
          id: 'g1', title: 'Correr 5km sem parar', category: 'saude', priority: 'high',
          description: 'Treinar progressivamente para completar 5km.', deadline: d(60),
          progress: 40, archived: false, createdAt: T,
          milestones: [
            { id: 'm1', title: 'Correr 1km contínuo', completed: true },
            { id: 'm2', title: 'Correr 2km contínuo', completed: true },
            { id: 'm3', title: 'Correr 3km contínuo', completed: false },
            { id: 'm4', title: 'Correr 5km contínuo', completed: false },
          ],
        },
        {
          id: 'g2', title: 'Lançar projeto pessoal', category: 'trabalho', priority: 'high',
          description: 'Desenvolver e publicar o MVP.', deadline: d(90),
          progress: 25, archived: false, createdAt: T,
          milestones: [
            { id: 'm5', title: 'Definir escopo do MVP', completed: true },
            { id: 'm6', title: 'Desenvolver backend', completed: false },
            { id: 'm7', title: 'Desenvolver frontend', completed: false },
            { id: 'm8', title: 'Deploy em produção', completed: false },
          ],
        },
        {
          id: 'g3', title: 'Ler 12 livros no ano', category: 'estudos', priority: 'medium',
          description: 'Um livro por mês.', deadline: d(180),
          progress: 58, archived: false, createdAt: T,
          milestones: [
            { id: 'm9',  title: '6 livros lidos', completed: true },
            { id: 'm10', title: '9 livros lidos', completed: false },
            { id: 'm11', title: '12 livros lidos', completed: false },
          ],
        },
      ],

      addGoal: (g) => set(s => ({
        goals: [...s.goals, { ...g, id: generateId(), createdAt: todayISO(), archived: false, milestones: [] }]
      })),

      updateGoal: (id, u) => set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...u } : g) })),

      deleteGoal: (id) => set(s => ({ goals: s.goals.filter(g => g.id !== id) })),

      toggleMilestone: (goalId, milestoneId) => set(s => ({
        goals: s.goals.map(g => {
          if (g.id !== goalId) return g
          const milestones = g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m)
          const done = milestones.filter(m => m.completed).length
          const progress = milestones.length ? Math.round((done / milestones.length) * 100) : g.progress
          return { ...g, milestones, progress }
        })
      })),

      addMilestone: (goalId, title) => set(s => ({
        goals: s.goals.map(g => g.id === goalId
          ? { ...g, milestones: [...g.milestones, { id: generateId(), title, completed: false }] }
          : g
        )
      })),

      getActiveGoals: () => get().goals.filter(g => !g.archived),
    }),
    { name: 'chronos-goals-v2' }
  )
)
