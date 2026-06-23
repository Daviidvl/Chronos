import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/lib/modal-context'
import type { StudyPlanItem, Subject } from '@/types'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DAYS_FULL = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo',
]

/* ── Add Sheet ─────────────────────────────────────────── */
function AddPlanSheet({ day, subjects, userId, onClose, onAdd }: {
  day: number
  subjects: Subject[]
  userId: string
  onClose: () => void
  onAdd: (item: StudyPlanItem) => void
}) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')
  const [note, setNote]           = useState('')
  const [saving, setSaving]       = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectId) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('study_plan_items')
      .insert({ user_id: userId, day_of_week: day, subject_id: subjectId, note: note.trim() || null })
      .select('*, subject:subjects(*)')
      .single()
    if (!error && data) { onAdd(data as StudyPlanItem); onClose() }
    setSaving(false)
  }

  const selected = subjects.find(s => s.id === subjectId)

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
            Adicionar a {DAYS_FULL[day]}
          </span>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        {subjects.length === 0 ? (
          <p style={{ fontSize: 14, color: '#9BA5B4', textAlign: 'center', padding: '24px 0' }}>
            Cria uma matéria primeiro no plano de estudos.
          </p>
        ) : (
          <form onSubmit={handleAdd}>
            {/* Subject picker */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Matéria</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {subjects.map(s => {
                  const active = subjectId === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSubjectId(s.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px',
                        borderRadius: 'var(--r)',
                        border: `1.5px solid ${active ? s.color + '80' : 'var(--bdr-2)'}`,
                        background: active ? s.color + '10' : '#fff',
                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: s.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {s.icon}
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: active ? s.color : '#121826' }}>
                        {s.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Note */}
            <div style={{ marginBottom: 28 }}>
              <label className="form-label">Conteúdo (opcional)</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={`Ex: Capítulo 3, Exercícios 1-10…`}
                className="field"
                style={{ marginTop: 6 }}
              />
            </div>

            <button
              type="submit"
              disabled={!subjectId || saving}
              className="btn btn-brand"
              style={{ background: selected?.color }}
            >
              {saving ? 'A guardar…' : `Adicionar ${selected?.name ?? ''}`}
            </button>
          </form>
        )}
      </motion.div>
    </>
  )
}

/* ── Main component ─────────────────────────────────────── */
export function WeeklyPlan({ items, subjects, userId, onAdd, onDelete }: {
  items: StudyPlanItem[]
  subjects: Subject[]
  userId: string
  onAdd: (item: StudyPlanItem) => void
  onDelete: (id: string) => void
}) {
  const todayDow = (new Date().getDay() + 6) % 7 // 0=Mon … 6=Sun
  const [activeDay, setActiveDay] = useState(todayDow)
  const [showAdd, setShowAdd]     = useState(false)
  const { open: openModal, close: closeModal } = useModal()

  const dayItems = items.filter(i => i.day_of_week === activeDay)

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 14 }}>
        <h2 className="section-title">Plano semanal</h2>
        <button
          onClick={() => { setShowAdd(true); openModal() }}
          className="btn btn-brand"
          style={{ width: 'auto', minHeight: 36, padding: '0 14px', fontSize: 13 }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Adicionar
        </button>
      </div>

      {/* Day tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {DAYS.map((d, i) => {
          const active    = activeDay === i
          const hasItems  = items.some(item => item.day_of_week === i)
          return (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              style={{
                flexShrink: 0,
                height: 34,
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
                  width: 5, height: 5, borderRadius: '50%',
                  background: '#6E5CF6',
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Day items */}
      <AnimatePresence mode="popLayout">
        {dayItems.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ fontSize: 13, color: '#C2CAD8', padding: '16px 0', textAlign: 'center' }}
          >
            Nenhum conteúdo para {DAYS_FULL[activeDay].toLowerCase()}
          </motion.p>
        ) : (
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {dayItems.map(item => {
              const subj = item.subject ?? subjects.find(s => s.id === item.subject_id)
              return (
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
                  {/* Subject icon */}
                  {subj && (
                    <div style={{
                      width: 32, height: 32, borderRadius: 9,
                      background: subj.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>
                      {subj.icon}
                    </div>
                  )}

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#121826', margin: 0 }}>
                      {subj?.name ?? '—'}
                    </p>
                    {item.note && (
                      <p style={{ fontSize: 12, color: '#9BA5B4', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.note}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button onClick={() => onDelete(item.id)} className="btn-icon danger" style={{ flexShrink: 0 }}>
                    <X size={13} />
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <AddPlanSheet
            day={activeDay}
            subjects={subjects}
            userId={userId}
            onClose={() => { setShowAdd(false); closeModal() }}
            onAdd={onAdd}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
