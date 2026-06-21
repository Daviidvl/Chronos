import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CalendarEvent } from '@/types'
import { generateId, todayISO } from '@/lib/utils'

interface CalendarState {
  events: CalendarEvent[]
  addEvent: (e: Omit<CalendarEvent, 'id'>) => void
  updateEvent: (id: string, u: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
  getEventsForDate: (date: string) => CalendarEvent[]
}

const T = todayISO()

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [
        { id: 'e1', title: 'Acordar',         date: T, startTime: '07:00', endTime: '07:30', category: 'pessoal', allDay: false },
        { id: 'e2', title: 'Muay Thai',        date: T, startTime: '08:30', endTime: '10:00', category: 'saude',   allDay: false },
        { id: 'e3', title: 'Trabalho',          date: T, startTime: '12:00', endTime: '18:00', category: 'trabalho',allDay: false },
        { id: 'e4', title: 'Academia',          date: T, startTime: '18:30', endTime: '20:00', category: 'saude',   allDay: false },
        { id: 'e5', title: 'Leitura noturna',   date: T, startTime: '21:00', endTime: '22:00', category: 'estudos', allDay: false },
      ],
      addEvent: (e) => set(s => ({ events: [...s.events, { ...e, id: generateId() }] })),
      updateEvent: (id, u) => set(s => ({ events: s.events.map(e => e.id === id ? { ...e, ...u } : e) })),
      deleteEvent: (id) => set(s => ({ events: s.events.filter(e => e.id !== id) })),
      getEventsForDate: (date) => get().events.filter(e => e.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    }),
    { name: 'chronos-calendar-v2' }
  )
)
