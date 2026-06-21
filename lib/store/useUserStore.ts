import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile, Achievement, XP_REWARDS } from '@/types'
import { generateId, calculateLevel } from '@/lib/utils'

interface UserState {
  user: UserProfile
  achievements: Achievement[]
  addXP: (amount: number, reason?: string) => void
  unlockAchievement: (id: string) => void
  updateUser: (updates: Partial<UserProfile>) => void
  getLevelInfo: () => ReturnType<typeof calculateLevel>
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: 'Primeiro Passo', description: 'Complete seu primeiro hábito', icon: '👣', xpReward: 25, unlocked: true, unlockedAt: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: 'a2', name: 'Semana Perfeita', description: 'Complete todos hábitos por 7 dias seguidos', icon: '🔥', xpReward: 50, unlocked: false },
  { id: 'a3', name: 'Mês de Ouro', description: '30 dias de streak', icon: '🏆', xpReward: 200, unlocked: false },
  { id: 'a4', name: 'Centenário', description: '100 dias de streak', icon: '💎', xpReward: 500, unlocked: false },
  { id: 'a5', name: 'Escritor', description: 'Escreva 10 entradas no diário', icon: '✍️', xpReward: 75, unlocked: false },
  { id: 'a6', name: 'Realizador', description: 'Conclua 100 tarefas', icon: '✅', xpReward: 100, unlocked: false },
  { id: 'a7', name: 'Visionário', description: 'Conclua sua primeira meta', icon: '🎯', xpReward: 100, unlocked: false },
  { id: 'a8', name: 'Mestre das Metas', description: 'Conclua 10 metas', icon: '🌟', xpReward: 500, unlocked: false },
  { id: 'a9', name: 'Madrugador', description: 'Complete 30 hábitos antes das 8h', icon: '🌅', xpReward: 75, unlocked: false },
  { id: 'a10', name: 'Equilibrado', description: 'Complete hábitos de 5 categorias diferentes', icon: '⚖️', xpReward: 100, unlocked: false },
]

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'user-1',
        name: 'João',
        level: 3,
        xp: 420,
        xpToNextLevel: 500,
        achievements: ['a1'],
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      achievements: DEFAULT_ACHIEVEMENTS,

      addXP: (amount) => {
        set(s => ({
          user: { ...s.user, xp: s.user.xp + amount },
        }))
      },

      unlockAchievement: (id) => {
        const { achievements, user } = get()
        const achievement = achievements.find(a => a.id === id)
        if (!achievement || achievement.unlocked) return

        set(s => ({
          achievements: s.achievements.map(a =>
            a.id === id ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
          ),
          user: {
            ...s.user,
            achievements: [...s.user.achievements, id],
            xp: s.user.xp + (achievement.xpReward ?? 0),
          },
        }))
      },

      updateUser: (updates) => {
        set(s => ({ user: { ...s.user, ...updates } }))
      },

      getLevelInfo: () => {
        return calculateLevel(get().user.xp)
      },
    }),
    { name: 'chronos-user' }
  )
)
