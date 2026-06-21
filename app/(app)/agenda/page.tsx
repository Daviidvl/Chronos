'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useCalendarStore } from '@/lib/store/useCalendarStore'
import { CalendarEvent, Category, CATEGORY_COLORS, CATEGORY_LABELS } from '@/types'
import { todayISO, getWeekDays } from '@/lib/utils'
import { format, isToday, addDays, subDays, addWeeks, subWeeks, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from 'lucide-react'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6)
const HOUR_H = 64

function TimelineView({ date }: { date: string }) {
  const { getEventsForDate, deleteEvent } = useCalendarStore()
  const events = getEventsForDate(date)
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }

  return (
    <div className="relative" style={{ height: HOURS.length * HOUR_H }}>
      {HOURS.map(h => (
        <div key={h} className="absolute left-0 right-0 flex items-start" style={{ top: (h - 6) * HOUR_H }}>
          <div className="w-14 text-[11px] text-[var(--text-4)] text-right pr-4 mt-[-7px] flex-shrink-0 tabular-nums">{String(h).padStart(2,'0')}:00</div>
          <div className="flex-1 border-t" style={{ borderColor: 'var(--border)' }} />
        </div>
      ))}

      {events.map(e => {
        const startMin = toMin(e.startTime)
        const endMin = e.endTime ? toMin(e.endTime) : startMin + 60
        const top = (startMin - 6 * 60) / 60 * HOUR_H
        const height = Math.max((endMin - startMin) / 60 * HOUR_H, 36)
        const color = CATEGORY_COLORS[e.category]
        if (top < 0) return null
        return (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-16 right-4 rounded-[14px] px-3 py-2 group overflow-hidden"
            style={{ top, height, background: `${color}16`, border: `1px solid ${color}35`, borderLeft: `3px solid ${color}` }}
          >
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate" style={{ color }}>{e.title}</div>
                {height > 42 && (
                  <div className="text-[11px] mt-0.5" style={{ color: `${color}80` }}>
                    {e.startTime}{e.endTime ? ` – ${e.endTime}` : ''}
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteEvent(e.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-[6px] transition-opacity flex-shrink-0"
                style={{ color }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        )
      })}

      {date === todayISO() && nowMin >= 6 * 60 && nowMin <= 24 * 60 && (
        <div className="absolute left-0 right-0 pointer-events-none z-10" style={{ top: (nowMin - 6 * 60) / 60 * HOUR_H }}>
          <div className="flex items-center">
            <div className="w-12 flex justify-end pr-3 flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-[var(--danger)]" />
            </div>
            <div className="flex-1 border-t-2 border-dashed border-[var(--danger)] opacity-70" />
          </div>
        </div>
      )}
    </div>
  )
}

function AddEventSheet({ date, onClose }: { date: string; onClose: () => void }) {
  const { addEvent } = useCalendarStore()
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [category, setCategory] = useState<Category>('pessoal')
  const cats = Object.entries(CATEGORY_LABELS).slice(0, 5) as [Category, string][]

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    addEvent({ title: title.trim(), startTime, endTime, date, category, allDay: false })
    onClose()
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-10"
        style={{ background: 'var(--surface-high)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-float)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border-focus)' }} />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[17px] font-semibold text-[var(--text-1)]">Novo Evento</h3>
          <button onClick={onClose} className="text-[var(--text-3)]"><X size={18} /></button>
        </div>
        <form onSubmit={handleAdd} className="space-y-3">
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do evento..."
            className="w-full px-4 py-3 rounded-[14px] text-[15px] outline-none text-[var(--text-1)] placeholder:text-[var(--text-4)]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
          <div className="grid grid-cols-2 gap-2">
            {[['Início', startTime, setStartTime], ['Fim', endTime, setEndTime]].map(([label, val, setter]) => (
              <div key={label as string}>
                <label className="block text-[11px] text-[var(--text-3)] mb-1">{label as string}</label>
                <input type="time" value={val as string} onChange={e => (setter as any)(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-[12px] text-[14px] outline-none text-[var(--text-1)]"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', colorScheme: 'dark' }} />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {cats.map(([key, label]) => {
              const color = CATEGORY_COLORS[key]
              const sel = category === key
              return (
                <button key={key} type="button" onClick={() => setCategory(key)}
                  className="flex-1 py-2 rounded-[12px] text-[11px] transition-all"
                  style={{ background: sel ? `${color}18` : 'var(--surface)', border: `1px solid ${sel ? color+'50' : 'var(--border)'}`, color: sel ? color : 'var(--text-3)' }}>
                  {label}
                </button>
              )
            })}
          </div>
          <button type="submit" disabled={!title.trim()}
            className="w-full py-3.5 rounded-[14px] text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'var(--accent)' }}>
            Adicionar
          </button>
        </form>
      </motion.div>
    </>
  )
}

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week'>('week')
  const [showAdd, setShowAdd] = useState(false)
  const { getEventsForDate } = useCalendarStore()

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const weekDays = getWeekDays(currentDate)

  const nav = (dir: 1 | -1) =>
    setCurrentDate(prev => view === 'day'
      ? (dir === 1 ? addDays(prev, 1) : subDays(prev, 1))
      : (dir === 1 ? addWeeks(prev, 1) : subWeeks(prev, 1)))

  return (
    <div className="h-full flex flex-col px-4 pt-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-[24px] font-semibold text-[var(--text-1)]">Agenda</h1>
          <div className="flex items-center gap-1 px-2 py-1 rounded-[10px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <button onClick={() => nav(-1)} className="p-1 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"><ChevronLeft size={14} /></button>
            <span className="text-[13px] font-medium text-[var(--text-2)] min-w-[140px] text-center capitalize">
              {format(currentDate, view === 'day' ? "dd 'de' MMMM" : "'Semana de' dd MMM", { locale: ptBR })}
            </span>
            <button onClick={() => nav(1)} className="p-1 text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-[10px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {(['day', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1 rounded-[8px] text-[12px] font-medium transition-all"
                style={{ background: view === v ? 'var(--surface-high)' : 'transparent', color: view === v ? 'var(--text-1)' : 'var(--text-3)' }}>
                {v === 'day' ? 'Dia' : 'Semana'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)}
            className="w-9 h-9 rounded-[12px] flex items-center justify-center text-white transition-opacity hover:opacity-85"
            style={{ background: 'var(--accent)' }}>
            <Plus size={16} />
          </button>
        </div>
      </motion.div>

      {/* Week strip */}
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-1 mb-3 flex-shrink-0">
          {weekDays.map(day => {
            const d = format(day, 'yyyy-MM-dd')
            const today = isToday(day)
            const sel = d === dateStr
            const hasEvents = getEventsForDate(d).length > 0
            return (
              <button key={d} onClick={() => { setCurrentDate(day); setView('day') }}
                className="flex flex-col items-center py-2.5 rounded-[14px] transition-all"
                style={{ background: sel ? 'var(--accent)' : today ? 'var(--surface)' : 'transparent', border: today && !sel ? '1px solid var(--border)' : '1px solid transparent' }}>
                <span className="text-[10px] mb-1" style={{ color: sel ? 'rgba(255,255,255,0.7)' : 'var(--text-3)' }}>
                  {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
                </span>
                <span className="text-[15px] font-semibold" style={{ color: sel ? 'white' : today ? 'var(--text-1)' : 'var(--text-2)' }}>
                  {format(day, 'd')}
                </span>
                {hasEvents && (
                  <div className="w-1 h-1 rounded-full mt-1" style={{ background: sel ? 'rgba(255,255,255,0.6)' : 'var(--accent)' }} />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto pt-2">
        <TimelineView date={dateStr} />
      </div>

      <AnimatePresence>{showAdd && <AddEventSheet date={dateStr} onClose={() => setShowAdd(false)} />}</AnimatePresence>
    </div>
  )
}
