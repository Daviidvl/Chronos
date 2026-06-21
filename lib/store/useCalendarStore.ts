import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CalendarEvent } from '@/types'
import { generateId, todayISO } from '@/lib/utils'

interface CalendarState {
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  deleteEvent: (id: string) => void
  getEventsForDate: (date: string) => CalendarEvent[]
  getEventsForWeek: (startDate: string, endDate: string) => CalendarEvent[]
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [
        {
          id: 'e1',
          title: 'Acordar',
          startTime: '07:00',
          endTime: '07:30',
          date: todayISO(),
          category: 'personal',
          allDay: false,
        },
        {
          id: 'e2',
          title: 'Leitura',
          startTime: '07:30',
          endTime: '08:30',
          date: todayISO(),
          category: 'personal',
          allDay: false,
        },
        {
          id: 'e3',
          title: 'Muay Thai',
          startTime: '08:30',
          endTime: '10:00',
          date: todayISO(),
          category: 'health',
          allDay: false,
        },
        {
          id: 'e4',
          title: 'Trabalho',
          startTime: '12:00',
          endTime: '18:00',
          date: todayISO(),
          category: 'work',
          allDay: false,
        },
        {
          id: 'e5',
          title: 'Academia',
          startTime: '18:30',
          endTime: '20:00',
          date: todayISO(),
          category: 'health',
          allDay: false,
        },
        {
          id: 'e6',
          title: 'Estudo',
          startTime: '21:00',
          endTime: '22:30',
          date: todayISO(),
          category: 'study',
          allDay: false,
        },
      ],

      addEvent: (event) => {
        set(s => ({ events: [...s.events, { ...event, id: generateId() }] }))
      },

      updateEvent: (id, updates) => {
        set(s => ({ events: s.events.map(e => e.id === id ? { ...e, ...updates } : e) }))
      },

      deleteEvent: (id) => {
        set(s => ({ events: s.events.filter(e => e.id !== id) }))
      },

      getEventsForDate: (date) => {
        return get().events
          .filter(e => e.date === date)
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
      },

      getEventsForWeek: (startDate, endDate) => {
        return get().events.filter(e => e.date >= startDate && e.date <= endDate)
      },
    }),
    { name: 'chronos-calendar' }
  )
)
