import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Goal, GoalMilestone } from '@/types'
import { generateId } from '@/lib/utils'

interface GoalsState {
  goals: Goal[]
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'archived' | 'milestones'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  archiveGoal: (id: string) => void
  deleteGoal: (id: string) => void
  addMilestone: (goalId: string, title: string) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void
  deleteMilestone: (goalId: string, milestoneId: string) => void
  updateProgress: (goalId: string) => void
  getActiveGoals: () => Goal[]
  getGoalsByCategory: (category: string) => Goal[]
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [
        {
          id: 'g1',
          title: 'Perder 5kg',
          description: 'Alcançar 80kg com saúde e consistência',
          category: 'health',
          priority: 'high',
          deadline: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
          progress: 35,
          habitIds: ['h1', 'h4'],
          milestones: [
            { id: 'm1', goalId: 'g1', title: 'Perder 1kg', completed: true, order: 0 },
            { id: 'm2', goalId: 'g1', title: 'Perder 2kg', completed: true, order: 1 },
            { id: 'm3', goalId: 'g1', title: 'Perder 3kg', completed: false, order: 2 },
            { id: 'm4', goalId: 'g1', title: 'Perder 4kg', completed: false, order: 3 },
            { id: 'm5', goalId: 'g1', title: 'Perder 5kg', completed: false, order: 4 },
          ],
          createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
          archived: false,
        },
        {
          id: 'g2',
          title: 'Guardar R$ 5.000',
          description: 'Fundo de emergência para cobrir 3 meses de despesas',
          category: 'finance',
          priority: 'high',
          deadline: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
          progress: 60,
          habitIds: [],
          milestones: [
            { id: 'm6', goalId: 'g2', title: 'Guardar R$1.000', completed: true, order: 0 },
            { id: 'm7', goalId: 'g2', title: 'Guardar R$2.500', completed: true, order: 1 },
            { id: 'm8', goalId: 'g2', title: 'Guardar R$5.000', completed: false, order: 2 },
          ],
          createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
          archived: false,
        },
        {
          id: 'g3',
          title: 'Dominar React/Next.js',
          description: 'Tornar-me um desenvolvedor sênior full stack',
          category: 'study',
          priority: 'medium',
          deadline: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
          progress: 45,
          habitIds: [],
          milestones: [
            { id: 'm9', goalId: 'g3', title: 'Concluir curso React', completed: true, order: 0 },
            { id: 'm10', goalId: 'g3', title: 'Construir 3 projetos', completed: false, order: 1 },
            { id: 'm11', goalId: 'g3', title: 'Aprender Next.js App Router', completed: false, order: 2 },
            { id: 'm12', goalId: 'g3', title: 'Contribuir com open source', completed: false, order: 3 },
          ],
          createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
          archived: false,
        },
      ],

      addGoal: (goal) => {
        set(s => ({
          goals: [...s.goals, {
            ...goal,
            id: generateId(),
            createdAt: new Date().toISOString(),
            archived: false,
            milestones: [],
          }],
        }))
      },

      updateGoal: (id, updates) => {
        set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...updates } : g) }))
      },

      archiveGoal: (id) => {
        set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, archived: true } : g) }))
      },

      deleteGoal: (id) => {
        set(s => ({ goals: s.goals.filter(g => g.id !== id) }))
      },

      addMilestone: (goalId, title) => {
        const goal = get().goals.find(g => g.id === goalId)
        if (!goal) return
        const newMilestone: GoalMilestone = {
          id: generateId(),
          goalId,
          title,
          completed: false,
          order: goal.milestones.length,
        }
        set(s => ({
          goals: s.goals.map(g =>
            g.id === goalId ? { ...g, milestones: [...g.milestones, newMilestone] } : g
          ),
        }))
        get().updateProgress(goalId)
      },

      toggleMilestone: (goalId, milestoneId) => {
        set(s => ({
          goals: s.goals.map(g =>
            g.id === goalId
              ? {
                  ...g,
                  milestones: g.milestones.map(m =>
                    m.id === milestoneId ? { ...m, completed: !m.completed } : m
                  ),
                }
              : g
          ),
        }))
        get().updateProgress(goalId)
      },

      deleteMilestone: (goalId, milestoneId) => {
        set(s => ({
          goals: s.goals.map(g =>
            g.id === goalId
              ? { ...g, milestones: g.milestones.filter(m => m.id !== milestoneId) }
              : g
          ),
        }))
        get().updateProgress(goalId)
      },

      updateProgress: (goalId) => {
        const goal = get().goals.find(g => g.id === goalId)
        if (!goal || goal.milestones.length === 0) return
        const completed = goal.milestones.filter(m => m.completed).length
        const progress = Math.round((completed / goal.milestones.length) * 100)
        set(s => ({
          goals: s.goals.map(g => g.id === goalId ? { ...g, progress } : g),
        }))
      },

      getActiveGoals: () => {
        return get().goals.filter(g => !g.archived).sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
      },

      getGoalsByCategory: (category) => {
        return get().goals.filter(g => !g.archived && g.category === category)
      },
    }),
    { name: 'chronos-goals' }
  )
)
