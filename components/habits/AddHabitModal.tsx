'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { HabitCategory, HabitFrequency, CATEGORY_COLORS } from '@/types'
import { getCategoryLabel, getFrequencyLabel } from '@/lib/utils'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const CATEGORIES: HabitCategory[] = ['health', 'fitness', 'mind', 'productivity', 'social', 'finance', 'spirituality']
const FREQUENCIES: HabitFrequency[] = ['daily', 'weekly', 'monthly']
const ICONS = ['💪', '📚', '🧘', '😴', '🏃', '🥗', '💧', '🧠', '✍️', '🎯', '💰', '🙏', '🎨', '🎵', '💊', '🌱']

interface AddHabitModalProps {
  open: boolean
  onClose: () => void
}

export function AddHabitModal({ open, onClose }: AddHabitModalProps) {
  const { addHabit } = useHabitsStore()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<HabitCategory>('health')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [targetPerWeek, setTargetPerWeek] = useState(7)
  const [icon, setIcon] = useState('💪')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addHabit({
      name: name.trim(),
      category,
      frequency,
      targetPerWeek,
      icon,
      color: CATEGORY_COLORS[category] ?? 'var(--accent)',
    })
    onClose()
    setName('')
    setCategory('health')
    setFrequency('daily')
    setTargetPerWeek(7)
    setIcon('💪')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Novo hábito</h2>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-tertiary)]">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Icon picker */}
                <div>
                  <label className="block text-xs text-[var(--text-tertiary)] mb-2">Ícone</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setIcon(i)}
                        className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                        style={{
                          background: icon === i ? 'var(--accent-subtle)' : 'var(--surface)',
                          border: `1.5px solid ${icon === i ? 'var(--accent)' : 'var(--border)'}`,
                        }}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Nome do hábito</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Leitura diária"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
                    autoFocus
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Categoria</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {CATEGORIES.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: category === c ? `${CATEGORY_COLORS[c]}20` : 'var(--surface)',
                          border: `1px solid ${category === c ? CATEGORY_COLORS[c] : 'var(--border)'}`,
                          color: category === c ? CATEGORY_COLORS[c] : 'var(--text-secondary)',
                        }}
                      >
                        {getCategoryLabel(c)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency + Target */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Frequência</label>
                    <select
                      value={frequency}
                      onChange={e => setFrequency(e.target.value as HabitFrequency)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      {FREQUENCIES.map(f => (
                        <option key={f} value={f}>{getFrequencyLabel(f)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">
                      Meta semanal: <span style={{ color: CATEGORY_COLORS[category] }}>{targetPerWeek}x</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={7}
                      value={targetPerWeek}
                      onChange={e => setTargetPerWeek(Number(e.target.value))}
                      className="w-full h-2 rounded-full mt-3"
                      style={{ accentColor: CATEGORY_COLORS[category] }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    <Plus size={14} /> Criar hábito
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
