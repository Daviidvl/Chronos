import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/lib/modal-context'
import type { StudyPlanItem } from '@/types'

const DAYS      = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DAYS_FULL = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo',
]

/* ── Add Sheet ─────────────────────────────────────────── */
function AddPlanSheet({ day, userId, onClose, onAdd }: {
  day: number
  userId: string
  onClose: () => void
  onAdd: (item: StudyPlanItem) => void
}) {
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')
  const [saving,  setSaving]  = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('study_plan_items')
      .insert({
        user_id:     userId,
        day_of_week: day,
        title:       title.trim(),
        content:     content.trim() || null,
      })
      .select()
      .single()
    if (!error && data) { onAdd(data as StudyPlanItem); onClose() }
    setSaving(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="sheet-overlay" onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 42 }}
        className="sheet-container sheet-body"
      >
        <div className="sheet-handle" />
        <div className="sheet-header">
          <span style={{ fontSize: 17, fontWeight: 700, color: '#121826', letterSpacing: '-0.3px' }}>
            {DAYS_FULL[day]}
          </span>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <form onSubmit={handleAdd}>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Matéria</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: POO - JAVA, Cálculo, Inglês…"
              className="field"
              style={{ marginTop: 6 }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="form-label">Conteúdo</label>
            <input
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Ex: Aula 124, 125, 126, 127"
              className="field"
              style={{ marginTop: 6 }}
            />
          </div>

          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="btn btn-brand"
          >
            {saving ? 'A guardar…' : 'Adicionar'}
          </button>
        </form>
      </motion.div>
    </>
  )
}

/* ── Main component ─────────────────────────────────────── */
export function WeeklyPlan({ items, userId, onAdd, onDelete }: {
  items: StudyPlanItem[]
  userId: string
  onAdd: (item: StudyPlanItem) => void
  onDelete: (id: string) => void
}) {
  const todayDow = (new Date().getDay() + 6) % 7
  const [activeDay, setActiveDay] = useState(todayDow)
  const [showAdd,   setShowAdd]   = useState(false)
  const { open: openModal, close: closeModal } = useModal()

  const dayItems = items.filter(i => i.day_of_week === activeDay)

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Day tabs + add button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, overflowX: 'auto', paddingBottom: 2 }}>
          {DAYS.map((d, i) => {
            const active   = activeDay === i
            const hasItems = items.some(item => item.day_of_week === i)
            return (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                style={{
                  flexShrink: 0,
                  height: 32,
                  padding: '0 12px',
                  borderRadius: 'var(--r-xs)',
                  border: `1.5px solid ${active ? '#6E5CF6' : 'var(--bdr-2)'}`,
                  background: active ? '#6E5CF6' : '#fff',
                  color: active ? '#fff' : hasItems ? '#121826' : '#9BA5B4',
                  fontSize: 12,
                  fontWeight: active ? 700 : hasItems ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  position: 'relative',
                }}
              >
                {d}
                {hasItems && !active && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#6E5CF6',
                  }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Add button inline */}
        <button
          onClick={() => { setShowAdd(true); openModal() }}
          style={{
            flexShrink: 0,
            height: 32,
            width: 32,
            borderRadius: 'var(--r-xs)',
            border: '1.5px solid var(--bdr-2)',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: '#6E5CF6',
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* Items for active day */}
      <AnimatePresence mode="popLayout">
        {dayItems.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: 13, color: '#C2CAD8', padding: '10px 0 4px', textAlign: 'center' }}
          >
            Nada planeado para {DAYS_FULL[activeDay].toLowerCase()}
          </motion.p>
        ) : (
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {dayItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--r)',
                  border: '1.5px solid var(--bdr-2)',
                  background: '#fff',
                }}
              >
                <div style={{
                  width: 3, borderRadius: 99, alignSelf: 'stretch',
                  background: '#6E5CF6', flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#121826', margin: 0 }}>
                    {item.title}
                  </p>
                  {item.content && (
                    <p style={{ fontSize: 13, color: '#9BA5B4', margin: '2px 0 0' }}>
                      {item.content}
                    </p>
                  )}
                </div>
                <button onClick={() => onDelete(item.id)} className="btn-icon danger" style={{ flexShrink: 0 }}>
                  <X size={13} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <AddPlanSheet
            day={activeDay}
            userId={userId}
            onClose={() => { setShowAdd(false); closeModal() }}
            onAdd={onAdd}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
