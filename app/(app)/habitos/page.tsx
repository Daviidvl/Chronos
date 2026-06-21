'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { CATEGORY_COLORS, CATEGORY_LABELS, Category } from '@/types'
import { todayISO, last7Days, computeHabitStats } from '@/lib/utils'
import { Check, Plus, ChevronDown, ChevronUp, Flame, TrendingUp, Trophy, X } from 'lucide-react'
import { subDays } from 'date-fns'

function HabitCard({ habit }: { habit: ReturnType<typeof useHabitsStore.getState>['habits'][0] }) {
  const { logs, getLogForDate, toggleHabit, deleteHabit } = useHabitsStore()
  const [expanded, setExpanded] = useState(false)
  const today = todayISO()
  const days = last7Days()
  const stats = computeHabitStats(logs, habit.id)
  const done = getLogForDate(habit.id, today)?.completed ?? false

  return (
    <motion.div
      layout
      className="rounded-[20px] overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[13px] font-semibold flex-shrink-0"
          style={{ background: `${habit.color}18`, color: habit.color }}
        >
          {habit.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[14px] font-medium ${done ? 'text-[var(--text-3)] line-through' : 'text-[var(--text-1)]'}`}>
              {habit.name}
            </span>
            {stats.currentStreak >= 3 && (
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.12)' }}>
                <Flame size={10} className="text-[var(--warning)]" />
                <span className="text-[10px] font-medium text-[var(--warning)]">{stats.currentStreak}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {days.map((d, i) => {
              const dayDone = getLogForDate(habit.id, d)?.completed ?? false
              const isToday = d === today
              return (
                <div
                  key={d}
                  className="w-4 h-4 rounded-full transition-all"
                  style={{
                    background: dayDone ? habit.color : 'rgba(255,255,255,0.06)',
                    opacity: isToday ? 1 : 0.6,
                    transform: isToday ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              )
            })}
          </div>
        </div>

        <button
          onClick={() => toggleHabit(habit.id)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0"
          style={{
            background: done ? habit.color : 'transparent',
            border: `2px solid ${done ? habit.color : 'rgba(255,255,255,0.14)'}`,
          }}
        >
          <AnimatePresence>
            {done && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                <Check size={15} strokeWidth={3} className="text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[var(--text-4)] hover:text-[var(--text-3)] transition-colors ml-1"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded stats */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0">
              <div className="h-px mb-4" style={{ background: 'var(--border)' }} />
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { icon: Flame,      value: stats.currentStreak, label: 'Sequência',   color: 'var(--warning)' },
                  { icon: Trophy,     value: stats.bestStreak,    label: 'Melhor',       color: 'var(--accent)' },
                  { icon: TrendingUp, value: `${stats.completionRate}%`, label: '30 dias', color: 'var(--positive)' },
                ].map(s => (
                  <div key={s.label} className="rounded-[14px] px-3 py-3 text-center" style={{ background: 'var(--surface-hover)' }}>
                    <s.icon size={14} className="mx-auto mb-1" style={{ color: s.color }} />
                    <div className="text-[16px] font-semibold text-[var(--text-1)]">{s.value}</div>
                    <div className="text-[11px] text-[var(--text-3)]">{s.label}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="text-[12px] text-[var(--text-4)] hover:text-[var(--danger)] transition-colors"
              >
                Remover hábito
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function AddHabitSheet({ onClose }: { onClose: () => void }) {
  const { addHabit } = useHabitsStore()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('pessoal')
  const categories = Object.entries(CATEGORY_LABELS) as [Category, string][]

  const handleAdd = () => {
    if (!name.trim()) return
    addHabit({
      name: name.trim(),
      category,
      color: CATEGORY_COLORS[category],
      frequency: 'daily',
      targetDays: 7,
    })
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-10"
        style={{ background: 'var(--surface-high)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-float)' }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border-focus)' }} />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[17px] font-semibold text-[var(--text-1)]">Novo Hábito</h3>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text-2)]"><X size={18} /></button>
        </div>

        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome do hábito..."
          className="w-full px-4 py-3 rounded-[14px] text-[15px] mb-4 outline-none text-[var(--text-1)] placeholder:text-[var(--text-4)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />

        <p className="text-[11px] text-[var(--text-3)] uppercase tracking-widest mb-3">Categoria</p>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {categories.map(([key, label]) => {
            const color = CATEGORY_COLORS[key]
            const sel = category === key
            return (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className="flex flex-col items-center gap-1.5 py-2.5 rounded-[12px] transition-all text-[11px]"
                style={{
                  background: sel ? `${color}18` : 'var(--surface)',
                  border: `1px solid ${sel ? color + '50' : 'var(--border)'}`,
                  color: sel ? color : 'var(--text-3)',
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                {label}
              </button>
            )
          })}
        </div>

        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="w-full py-3.5 rounded-[14px] text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: 'var(--accent)' }}
        >
          Criar Hábito
        </button>
      </motion.div>
    </>
  )
}

export default function HabitosPage() {
  const { getActiveHabits, getLogForDate, logs } = useHabitsStore()
  const [showAdd, setShowAdd] = useState(false)
  const today = todayISO()
  const habits = getActiveHabits()
  const done = habits.filter(h => getLogForDate(h.id, today)?.completed).length

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-6">
      <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-semibold text-[var(--text-1)] tracking-tight leading-none">Hábitos</h1>
          <p className="text-[14px] text-[var(--text-3)] mt-2">
            {done}/{habits.length} concluídos hoje
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-[13px] font-medium text-white transition-opacity hover:opacity-85"
          style={{ background: 'var(--accent)', marginTop: 4 }}
        >
          <Plus size={15} /> Novo
        </button>
      </motion.header>

      {habits.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <p className="text-[14px] text-[var(--text-3)]">Nenhum hábito ainda.</p>
          <p className="text-[13px] text-[var(--text-4)] mt-1">Crie seu primeiro hábito para começar.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {habits.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <HabitCard habit={h} />
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>{showAdd && <AddHabitSheet onClose={() => setShowAdd(false)} />}</AnimatePresence>
    </div>
  )
}
