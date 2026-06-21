'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCalendarStore } from '@/lib/store/useCalendarStore'
import { CalendarEvent, EventCategory, CATEGORY_COLORS } from '@/types'
import { todayISO, formatDate, getCategoryLabel, generateId, cn, getWeekDays } from '@/lib/utils'
import { format, parseISO, addDays, subDays, addWeeks, subWeeks, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const EVENT_CATEGORIES: EventCategory[] = ['work', 'health', 'study', 'leisure', 'personal']

function TimelineView({ date, events }: { date: string; events: CalendarEvent[] }) {
  const { deleteEvent } = useCalendarStore()
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const hourHeight = 60

  return (
    <div className="relative" style={{ height: 24 * hourHeight + 'px' }}>
      {/* Hour lines */}
      {HOURS.map(h => (
        <div
          key={h}
          className="absolute left-0 right-0 flex items-start"
          style={{ top: h * hourHeight }}
        >
          <div className="w-12 text-[11px] text-[var(--text-tertiary)] text-right pr-3 mt-[-8px] flex-shrink-0 select-none">
            {String(h).padStart(2, '0')}:00
          </div>
          <div className="flex-1 border-t border-[var(--border)] mt-0" />
        </div>
      ))}

      {/* Events */}
      {events.map(event => {
        const startMin = timeToMinutes(event.startTime)
        const endMin = event.endTime ? timeToMinutes(event.endTime) : startMin + 60
        const top = (startMin / 60) * hourHeight
        const height = Math.max(((endMin - startMin) / 60) * hourHeight, 30)
        const color = CATEGORY_COLORS[event.category] ?? 'var(--accent)'
        const isHovered = hoveredEvent === event.id

        return (
          <motion.div
            key={event.id}
            className="absolute left-14 right-3 rounded-xl px-2.5 py-1.5 cursor-pointer"
            style={{
              top,
              height,
              background: `${color}20`,
              border: `1px solid ${color}40`,
              borderLeft: `3px solid ${color}`,
            }}
            whileHover={{ x: 2 }}
            onMouseEnter={() => setHoveredEvent(event.id)}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            <div className="flex items-start justify-between gap-1">
              <div>
                <div className="text-xs font-medium truncate" style={{ color }}>
                  {event.title}
                </div>
                {height > 35 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={9} style={{ color: `${color}80` }} />
                    <span className="text-[10px]" style={{ color: `${color}80` }}>
                      {event.startTime}{event.endTime ? ` – ${event.endTime}` : ''}
                    </span>
                  </div>
                )}
              </div>
              {isHovered && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteEvent(event.id) }}
                  className="p-0.5 rounded hover:bg-[rgba(239,68,68,0.2)] transition-colors flex-shrink-0"
                >
                  <Trash2 size={11} style={{ color: 'var(--danger)' }} />
                </button>
              )}
            </div>
          </motion.div>
        )
      })}

      {/* Current time indicator */}
      {date === todayISO() && (() => {
        const now = new Date()
        const min = now.getHours() * 60 + now.getMinutes()
        const top = (min / 60) * hourHeight
        return (
          <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top }}>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 ml-10 flex-shrink-0" />
              <div className="flex-1 border-t border-red-500 border-dashed" />
            </div>
          </div>
        )
      })()}
    </div>
  )
}

function AddEventModal({ open, onClose, date }: { open: boolean; onClose: () => void; date: string }) {
  const { addEvent } = useCalendarStore()
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [category, setCategory] = useState<EventCategory>('personal')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addEvent({ title: title.trim(), startTime, endTime, date, category, allDay: false })
    onClose()
    setTitle('')
    setStartTime('09:00')
    setEndTime('10:00')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Novo evento</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-3">
                <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Título do evento"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-[var(--text-tertiary)] mb-1">Início</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-tertiary)] mb-1">Fim</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {EVENT_CATEGORIES.map(c => {
                    const color = CATEGORY_COLORS[c] ?? 'var(--accent)'
                    return (
                      <button key={c} type="button" onClick={() => setCategory(c)}
                        className="py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: category === c ? `${color}20` : 'var(--surface)',
                          border: `1px solid ${category === c ? color : 'var(--border)'}`,
                          color: category === c ? color : 'var(--text-tertiary)',
                        }}>
                        {getCategoryLabel(c)}
                      </button>
                    )
                  })}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={!title.trim()}>
                    <Plus size={14} /> Adicionar
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function CalendarPage() {
  const { getEventsForDate } = useCalendarStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week'>('day')
  const [modalOpen, setModalOpen] = useState(false)

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const events = getEventsForDate(dateStr)

  const navigate = (dir: 1 | -1) => {
    setCurrentDate(prev => view === 'day' ? (dir === 1 ? addDays(prev, 1) : subDays(prev, 1)) : (dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1)))
  }

  const weekDays = getWeekDays(currentDate)

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Agenda</h1>
          <div className="flex items-center gap-1 px-3 py-1 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <button onClick={() => navigate(-1)} className="p-0.5 hover:text-[var(--text-primary)] text-[var(--text-tertiary)] transition-colors"><ChevronLeft size={14} /></button>
            <span className="text-xs font-medium text-[var(--text-primary)] min-w-[140px] text-center capitalize">
              {format(currentDate, view === 'day' ? "dd 'de' MMMM, yyyy" : "'Semana de' dd MMM", { locale: ptBR })}
            </span>
            <button onClick={() => navigate(1)} className="p-0.5 hover:text-[var(--text-primary)] text-[var(--text-tertiary)] transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {(['day', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn('px-3 py-1 rounded-md text-xs font-medium transition-all', view === v ? 'bg-[var(--surface-active)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]')}>
                {v === 'day' ? 'Dia' : 'Semana'}
              </button>
            ))}
          </div>
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={14} />
          </Button>
        </div>
      </motion.div>

      {/* Week header */}
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekDays.map(day => {
            const d = format(day, 'yyyy-MM-dd')
            const todayDate = isToday(day)
            const isSelected = d === dateStr
            return (
              <button key={d} onClick={() => { setCurrentDate(day); setView('day') }}
                className={cn(
                  'flex flex-col items-center py-2 rounded-xl transition-all',
                  isSelected ? 'bg-[var(--accent)] text-white' :
                  todayDate ? 'bg-[var(--surface-hover)]' : 'hover:bg-[var(--surface-hover)]'
                )}>
                <span className="text-[10px] text-[var(--text-tertiary)] uppercase">{format(day, 'EEE', { locale: ptBR })}</span>
                <span className="text-sm font-semibold">{format(day, 'd')}</span>
                {getEventsForDate(d).length > 0 && (
                  <div className="w-1 h-1 rounded-full mt-1" style={{ background: isSelected ? 'white' : 'var(--accent)' }} />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="pt-4">
          <TimelineView date={dateStr} events={events} />
        </div>
      </div>

      <AddEventModal open={modalOpen} onClose={() => setModalOpen(false)} date={dateStr} />
    </div>
  )
}
