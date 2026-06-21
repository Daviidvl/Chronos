import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile } from '@/types'

interface UserState {
  user: UserProfile
  updateUser: (u: Partial<UserProfile>) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: { id: 'local', name: 'David' },
      updateUser: (u) => set(s => ({ user: { ...s.user, ...u } })),
    }),
    { name: 'chronos-user-v2' }
  )
)
