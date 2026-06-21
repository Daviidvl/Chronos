import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { JournalEntry, JournalMood } from '@/types'
import { generateId, todayISO } from '@/lib/utils'

interface JournalState {
  entries: JournalEntry[]
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void
  deleteEntry: (id: string) => void
  getEntryForDate: (date: string) => JournalEntry | undefined
  getOrCreateToday: () => JournalEntry
  hasEntryForDate: (date: string) => boolean
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [
        {
          id: 'j1',
          date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
          content: '## Reflexão do dia\n\nFoi um dia produtivo. Consegui completar minha rotina de exercícios e ainda tive tempo para leitura.\n\n**O que aprendi:** A consistência supera a perfeição.\n\n**Gratidão:** Saúde, família e foco.',
          mood: 'good',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'j2',
          date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
          content: '## Como foi meu dia?\n\nDia desafiador, mas consegui manter o foco nas tarefas prioritárias.\n\n**Melhoria:** Preciso dormir mais cedo para otimizar minha energia matinal.',
          mood: 'okay',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      ],

      addEntry: (entry) => {
        const now = new Date().toISOString()
        set(s => ({
          entries: [...s.entries, {
            ...entry,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          }],
        }))
      },

      updateEntry: (id, updates) => {
        set(s => ({
          entries: s.entries.map(e =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        }))
      },

      deleteEntry: (id) => {
        set(s => ({ entries: s.entries.filter(e => e.id !== id) }))
      },

      getEntryForDate: (date) => {
        return get().entries.find(e => e.date === date)
      },

      hasEntryForDate: (date) => {
        return get().entries.some(e => e.date === date)
      },

      getOrCreateToday: () => {
        const today = todayISO()
        const existing = get().entries.find(e => e.date === today)
        if (existing) return existing
        const now = new Date().toISOString()
        const newEntry: JournalEntry = {
          id: generateId(),
          date: today,
          content: '',
          createdAt: now,
          updatedAt: now,
        }
        set(s => ({ entries: [...s.entries, newEntry] }))
        return newEntry
      },
    }),
    { name: 'chronos-journal' }
  )
)
