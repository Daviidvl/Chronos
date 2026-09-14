import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, RotateCcw, Sun, Moon, Trash2, Check } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/lib/modal-context'
import { calcStreak, todayISO } from '@/lib/utils'
import { randomPhrase } from '@/lib/motivational-phrases'
import { StudyHeader }  from '@/components/estudos/StudyHeader'
import { StudyStats }   from '@/components/estudos/StudyStats'
import { StudyHeatmap } from '@/components/estudos/StudyHeatmap'
import { SubjectCard } from '@/components/estudos/SubjectCard'
import { ShareReveal, type ShareSubjectStat } from '@/components/estudos/ShareReveal'
import type { Subject, Topic, TopicPeriod, SubjectSchedule, StudySession, DayCompletion } from '@/types'

const PERIODS: { key: TopicPeriod; label: string; Icon: typeof Sun }[] = [
  { key: 'manha', label: 'Manhã', Icon: Sun },
  { key: 'noite', label: 'Noite', Icon: Moon },
]

const PALETTE = [
  '#6E5CF6', '#2563EB', '#2CC08C', '#F79009',
  '#F04438', '#EC4899', '#0EA5E9', '#8B5CF6',
]

const DAYS_PT  = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DAYS_FULL = [
  'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo',
]

// "Reiniciar semana": completed content is deleted so the subject is ready
// for the new week. Pending content stays exactly where it is — subjects
// aren't studied on the same days every week, so their schedule (which day
// each one lives on) is left untouched instead of being shuffled around.

// ---------- ResetWeekSheet ----------
function ResetWeekSheet({ count, onConfirm, onClose }: {
  count: number
  onConfirm: () => void
  onClose: () => void
}) {
  const [saving, setSaving] = useState(false)

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
            Reiniciar semana
          </span>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <p style={{ fontSize: 14, color: '#6E7787', lineHeight: 1.5, marginBottom: 20 }}>
          {count} {count === 1 ? 'conteúdo concluído vai sair' : 'conteúdos concluídos vão sair'} do plano — a matéria continua no mesmo dia, só o conteúdo já feito é removido. O que ainda está pendente permanece intacto, no mesmo dia de sempre.
        </p>

        <button
          onClick={async () => { setSaving(true); await onConfirm(); setSaving(false); onClose() }}
          disabled={saving}
          className="btn btn-brand"
        >
          {saving ? 'Reorganizando…' : 'Reorganizar conteúdo'}
        </button>
      </motion.div>
    </>
  )
}

// ---------- MoveSubjectSheet ----------
function MoveSubjectSheet({ subject, currentDay, onSelectDay, onClose }: {
  subject: Subject
  currentDay: number
  onSelectDay: (day: number) => Promise<void>
  onClose: () => void
}) {
  const [saving, setSaving] = useState<number | null>(null)

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
            Mover conteúdo
          </span>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <p style={{ fontSize: 14, color: '#6E7787', lineHeight: 1.5, marginBottom: 16 }}>
          Todo o conteúdo de {subject.name} neste dia vai para o dia escolhido.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {DAYS_FULL.map((label, day) => (
            <button
              key={day}
              onClick={async () => { setSaving(day); await onSelectDay(day); setSaving(null) }}
              disabled={saving !== null || day === currentDay}
              className="btn btn-ghost"
              style={{
                justifyContent: 'space-between',
                fontWeight: day === currentDay ? 700 : 500,
                color: day === currentDay ? '#6E5CF6' : '#121826',
              }}
            >
              {label}
              {day === currentDay && <span style={{ fontSize: 12 }}>Dia atual</span>}
            </button>
          ))}
        </div>
      </motion.div>
    </>
  )
}

// ---------- SubjectSheet (create or edit) ----------
function SubjectSheet({ userId, subject, onAdd, onEdit, onDelete, onClose }: {
  userId: string
  subject?: Subject
  onAdd: (s: Subject) => void
  onEdit: (s: Subject) => void
  onDelete?: (id: string) => Promise<void>
  onClose: () => void
}) {
  const isEdit = !!subject
  const [name,   setName]   = useState(subject?.name ?? '')
  const [color,  setColor]  = useState(subject?.color ?? PALETTE[0])
  const [goal,   setGoal]   = useState(String(subject?.daily_goal_minutes ?? 60))
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!subject) return
    setDeleting(true)
    await onDelete?.(subject.id)
    setDeleting(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()

    if (isEdit) {
      const { data, error } = await supabase
        .from('subjects')
        .update({ name: name.trim(), color, daily_goal_minutes: parseInt(goal) || 60 })
        .eq('id', subject.id)
        .select().single()
      if (!error && data) { onEdit(data as Subject); onClose() }
    } else {
      const icon = name.trim().charAt(0).toUpperCase()
      const { data, error } = await supabase
        .from('subjects')
        .insert({ user_id: userId, name: name.trim(), color, icon, daily_goal_minutes: parseInt(goal) || 60 })
        .select().single()
      if (!error && data) { onAdd(data as Subject); onClose() }
    }
    setSaving(false)
  }

  const preview = subject?.icon ?? (name.trim().charAt(0).toUpperCase() || 'A')

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
            {isEdit ? 'Editar matéria' : 'Nova matéria'}
          </span>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff',
              boxShadow: `0 4px 16px ${color}40`,
            }}>
              {preview}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Nome</label>
            <input
              autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Matemática, Inglês…" className="field" style={{ marginTop: 6 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Cor</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {PALETTE.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`color-swatch${color === c ? ' color-swatch--active' : ''}`}
                  style={{ background: c, outlineColor: c }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Meta diária (minutos)</label>
            <input type="number" min="15" max="480" value={goal}
              onChange={e => setGoal(e.target.value)}
              className="field field-sm" style={{ marginTop: 6 }}
            />
          </div>

          <button type="submit" disabled={!name.trim() || saving}
            className="btn btn-brand" style={{ background: color }}
          >
            {saving ? 'A guardar…' : isEdit ? 'Guardar alterações' : `Adicionar ${name || 'matéria'}`}
          </button>
        </form>

        {isEdit && onDelete && (
          confirmingDelete ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="btn btn-ghost"
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn"
                style={{ flex: 1, background: '#FEE4E2', color: '#F04438' }}
              >
                {deleting ? 'A eliminar…' : 'Confirmar eliminação'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="btn btn-ghost"
              style={{ marginTop: 12, color: '#F04438', gap: 6 }}
            >
              <Trash2 size={14} />
              Eliminar matéria
            </button>
          )
        )}
      </motion.div>
    </>
  )
}

// ---------- AddToDaySheet ----------
function AddToDaySheet({ day, subjects, scheduledIds, onAdd, onCreateNew, onDeleteSubject, onClose }: {
  day: number
  subjects: Subject[]
  scheduledIds: string[]
  onAdd: (subjectId: string) => void
  onCreateNew: () => void
  onDeleteSubject: (id: string) => Promise<void>
  onClose: () => void
}) {
  const available = subjects.filter(s => !scheduledIds.includes(s.id))
  const [deleteMode, setDeleteMode]     = useState(false)
  const [selectedIds, setSelectedIds]   = useState<string[]>([])
  const [confirming, setConfirming]     = useState(false)
  const [deleting, setDeleting]         = useState(false)

  const cancelDeleteMode = () => {
    setDeleteMode(false)
    setSelectedIds([])
    setConfirming(false)
  }

  const toggleSelect = (id: string) => {
    setConfirming(false)
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleDelete = async () => {
    if (selectedIds.length === 0) return
    setDeleting(true)
    await Promise.all(selectedIds.map(id => onDeleteSubject(id)))
    setDeleting(false)
    cancelDeleteMode()
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {available.map(s => {
            const selected = selectedIds.includes(s.id)
            return (
              <button
                key={s.id}
                onClick={() => { if (deleteMode) toggleSelect(s.id); else { onAdd(s.id); onClose() } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 'var(--r)',
                  border: `1.5px solid ${selected ? '#F04438' : 'var(--bdr-2)'}`,
                  background: selected ? '#FEF3F2' : '#fff',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                {deleteMode && (
                  <span
                    className={`check${selected ? ' check--done' : ''}`}
                    style={selected ? { background: '#F04438', borderColor: '#F04438' } : undefined}
                  >
                    {selected && <Check size={12} strokeWidth={3} color="#fff" />}
                  </span>
                )}

                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#121826' }}>{s.name}</span>
              </button>
            )
          })}

          {available.length === 0 && (
            <p style={{ fontSize: 13, color: '#9BA5B4', textAlign: 'center', padding: '8px 0' }}>
              Todas as matérias já estão neste dia.
            </p>
          )}

          {deleteMode ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={cancelDeleteMode}
                disabled={deleting}
                className="btn btn-ghost"
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              {confirming ? (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn"
                  style={{ flex: 1, background: '#FEE4E2', color: '#F04438' }}
                >
                  {deleting ? 'A eliminar…' : 'Confirmar eliminação'}
                </button>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  disabled={selectedIds.length === 0}
                  className="btn"
                  style={{ flex: 1, background: '#FEE4E2', color: '#F04438' }}
                >
                  Eliminar{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={() => { onClose(); onCreateNew() }} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px', borderRadius: 'var(--r)',
                border: '1.5px dashed var(--bdr-2)', background: 'transparent',
                cursor: 'pointer', fontSize: 14, fontWeight: 600,
                color: '#6E5CF6', fontFamily: 'inherit',
              }}>
                <Plus size={14} strokeWidth={2.5} />
                Criar nova matéria
              </button>

              <button onClick={() => setDeleteMode(true)} style={{
                width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--r)',
                border: '1.5px dashed #FEE4E2', background: 'transparent',
                cursor: 'pointer', color: '#F04438', flexShrink: 0,
              }} title="Eliminar matéria">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ---------- Skeleton ----------
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skel" style={{ height: 180, borderRadius: 'var(--r-lg)' }} />
      <div className="stat-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="skel" style={{ height: 90, borderRadius: 'var(--r)' }} />
        ))}
      </div>
      <div className="skel" style={{ height: 110, borderRadius: 'var(--r)' }} />
      {[1, 2].map(i => (
        <div key={`s${i}`} className="skel" style={{ height: 100, borderRadius: 'var(--r)' }} />
      ))}
    </div>
  )
}

// ---------- Page ----------
export default function InicioPage() {
  const [subjects,     setSubjects]     = useState<Subject[]>([])
  const [topics,       setTopics]       = useState<Topic[]>([])
  const [schedules,    setSchedules]    = useState<SubjectSchedule[]>([])
  const [sessions,     setSessions]     = useState<StudySession[]>([])
  const [allSessions,  setAllSessions]  = useState<StudySession[]>([])
  const [completedDays, setCompletedDays] = useState<string[]>([])
  const [streak,        setStreak]        = useState(0)
  const [userId,       setUserId]       = useState('')
  const todayDayOfWeek = (new Date().getDay() + 6) % 7
  const [activeDay,    setActiveDay]    = useState(() => todayDayOfWeek)
  const [showAdd,       setShowAdd]       = useState(false)
  const [showAddToDay,  setShowAddToDay]  = useState(false)
  const [showResetWeek, setShowResetWeek] = useState(false)
  const [movingSubject, setMovingSubject] = useState<{ subject: Subject; period: TopicPeriod } | null>(null)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [shareData,     setShareData]     = useState<{ streak: number; totalMinutes: number; subjects: ShareSubjectStat[]; phrase: string } | null>(null)
  const [loading,       setLoading]       = useState(true)

  const { open: openModal, close: closeModal } = useModal()

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    const ninetyAgo = format(addDays(new Date(), -104), 'yyyy-MM-dd')

    const [
      { data: subjectsData },
      { data: topicsData },
      { data: schedulesData },
      { data: sessionsData },
      { data: completionsData },
      { data: allSessionsData },
    ] = await Promise.all([
      supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('topics').select('*, subject:subjects(*)').eq('user_id', user.id).order('created_at'),
      supabase.from('subject_schedules').select('*').eq('user_id', user.id),
      supabase.from('study_sessions').select('*').eq('user_id', user.id).eq('date', todayISO()),
      supabase.from('day_completions').select('date').eq('user_id', user.id).gte('date', ninetyAgo),
      supabase.from('study_sessions').select('date, duration_minutes').eq('user_id', user.id).gte('date', ninetyAgo),
    ])

    const completedDates = ((completionsData as Pick<DayCompletion, 'date'>[]) ?? []).map(r => r.date)

    setSubjects((subjectsData as Subject[]) ?? [])
    setTopics((topicsData as Topic[]) ?? [])
    setSchedules((schedulesData as SubjectSchedule[]) ?? [])
    setSessions((sessionsData as StudySession[]) ?? [])
    setCompletedDays(completedDates)
    setStreak(calcStreak(completedDates))
    setAllSessions((allSessionsData as StudySession[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const refreshProgress = useCallback(async (uid: string) => {
    const supabase = createClient()
    const ninetyAgo = format(addDays(new Date(), -104), 'yyyy-MM-dd')

    const [
      { data: sessionsData },
      { data: completionsData },
      { data: allSessionsData },
    ] = await Promise.all([
      supabase.from('study_sessions').select('*').eq('user_id', uid).eq('date', todayISO()),
      supabase.from('day_completions').select('date').eq('user_id', uid).gte('date', ninetyAgo),
      supabase.from('study_sessions').select('date, duration_minutes').eq('user_id', uid).gte('date', ninetyAgo),
    ])

    const completedDates = ((completionsData as Pick<DayCompletion, 'date'>[]) ?? []).map(r => r.date)
    setSessions((sessionsData as StudySession[]) ?? [])
    setCompletedDays(completedDates)
    setStreak(calcStreak(completedDates))
    setAllSessions((allSessionsData as StudySession[]) ?? [])
  }, [])

  const toggleTopic = async (topic: Topic, done: boolean) => {
    const supabase = createClient()
    const updates: Partial<Topic> = {
      completed:    done,
      completed_at: done ? new Date().toISOString() : null,
    }
    await supabase.from('topics').update(updates).eq('id', topic.id)
    setTopics(ts => ts.map(t => t.id === topic.id ? { ...t, ...updates } : t))

    if (done) {
      await supabase.from('study_sessions').insert({
        user_id: userId,
        subject_id: topic.subject_id,
        date: todayISO(),
        duration_minutes: topic.estimated_minutes,
      })
    }

    // Full day of study completed today? Update the streak/heatmap marker accordingly.
    // Re-checked straight from the database (not local state) so rapid clicks or
    // out-of-sync state can never mask a topic that's still pending.
    if (topic.day_of_week === todayDayOfWeek) {
      const today = todayISO()
      const { data: dayTopics } = await supabase
        .from('topics')
        .select('completed, estimated_minutes, subject_id, subject:subjects(*)')
        .eq('user_id', userId)
        .eq('day_of_week', todayDayOfWeek)
      const allDone = !!dayTopics && dayTopics.length > 0 && dayTopics.every(t => t.completed)

      if (allDone) {
        await supabase
          .from('day_completions')
          .upsert({ user_id: userId, date: today }, { onConflict: 'user_id,date', ignoreDuplicates: true })

        // Day just flipped to complete because of this action (not a re-check
        // of an already-complete day) — that's the "finish activity" moment.
        if (done && dayTopics) {
          const bySubject = new Map<string, ShareSubjectStat>()
          for (const t of dayTopics as unknown as (Topic & { subject: Subject | null })[]) {
            if (!t.subject) continue
            const prev = bySubject.get(t.subject_id)
            bySubject.set(t.subject_id, {
              id: t.subject.id,
              name: t.subject.name,
              icon: t.subject.icon,
              color: t.subject.color,
              minutes: (prev?.minutes ?? 0) + t.estimated_minutes,
            })
          }
          setShareData({
            streak: calcStreak([...completedDays, today]),
            totalMinutes: dayTopics.reduce((s, t) => s + t.estimated_minutes, 0),
            subjects: Array.from(bySubject.values()).sort((a, b) => b.minutes - a.minutes),
            phrase: randomPhrase(),
          })
          openModal()
        }
      } else {
        await supabase.from('day_completions').delete().eq('user_id', userId).eq('date', today)
      }
    }

    await refreshProgress(userId)
  }

  const addTopic = async (subjectId: string, title: string, estimatedMinutes: number, period: TopicPeriod) => {
    const siblingTopics = topics.filter(t => t.subject_id === subjectId && t.day_of_week === activeDay && t.period === period)
    const position = siblingTopics.length > 0 ? Math.max(...siblingTopics.map(t => t.position)) + 1 : 0

    const supabase = createClient()
    const { data } = await supabase
      .from('topics')
      .insert({ user_id: userId, subject_id: subjectId, title, estimated_minutes: estimatedMinutes, day_of_week: activeDay, position, period })
      .select('*, subject:subjects(*)')
      .single()
    if (data) setTopics(ts => [...ts, data as Topic])

    const alreadyScheduled = schedules.some(sc => sc.subject_id === subjectId && sc.day_of_week === activeDay)
    if (!alreadyScheduled) {
      try {
        const { data: sc } = await supabase
          .from('subject_schedules')
          .upsert({ user_id: userId, subject_id: subjectId, day_of_week: activeDay }, { ignoreDuplicates: true })
          .select().maybeSingle()
        if (sc) setSchedules(prev => [...prev, sc as SubjectSchedule])
      } catch { /* table may not exist yet */ }
    }
  }

  const deleteSubject = async (id: string) => {
    const supabase = createClient()
    await supabase.from('subjects').delete().eq('id', id)
    setSubjects(ss => ss.filter(s => s.id !== id))
    setTopics(ts => ts.filter(t => t.subject_id !== id))
    setSchedules(sc => sc.filter(s => s.subject_id !== id))
  }

  const deleteTopic = async (topic: Topic) => {
    const supabase = createClient()
    await supabase.from('topics').delete().eq('id', topic.id)
    setTopics(ts => ts.filter(t => t.id !== topic.id))
  }

  const togglePeriod = async (topic: Topic) => {
    const newPeriod: TopicPeriod = topic.period === 'manha' ? 'noite' : 'manha'
    const supabase = createClient()
    await supabase.from('topics').update({ period: newPeriod }).eq('id', topic.id)
    setTopics(ts => ts.map(t => t.id === topic.id ? { ...t, period: newPeriod } : t))
  }

  const editTopic = async (topic: Topic, title: string, estimatedMinutes: number) => {
    const supabase = createClient()
    await supabase.from('topics').update({ title, estimated_minutes: estimatedMinutes }).eq('id', topic.id)
    setTopics(ts => ts.map(t => t.id === topic.id ? { ...t, title, estimated_minutes: estimatedMinutes } : t))
  }

  const resetWeek = async () => {
    const completedIds = topics.filter(t => t.completed && t.day_of_week !== null).map(t => t.id)
    if (completedIds.length === 0) return

    const supabase = createClient()
    await supabase.from('topics').delete().in('id', completedIds)

    setTopics(ts => ts.filter(t => !completedIds.includes(t.id)))
  }

  // Drag-to-reorder within a subject's list for the active day.
  const reorderTopics = async (ordered: Topic[]) => {
    const updates = ordered.map((t, i) => ({ id: t.id, position: i }))
    setTopics(ts => ts.map(t => {
      const u = updates.find(u => u.id === t.id)
      return u ? { ...t, position: u.position } : t
    }))
    const supabase = createClient()
    await Promise.all(updates.map(u => supabase.from('topics').update({ position: u.position }).eq('id', u.id)))
  }

  const moveSubjectToDay = async (subjectId: string, period: TopicPeriod, newDay: number) => {
    if (newDay === activeDay) { setMovingSubject(null); return }

    const subjectTopics = topics.filter(t => t.subject_id === subjectId && t.day_of_week === activeDay && t.period === period)
    const targetSiblings = topics.filter(t => t.subject_id === subjectId && t.day_of_week === newDay && t.period === period)
    let nextPosition = targetSiblings.length > 0 ? Math.max(...targetSiblings.map(t => t.position)) + 1 : 0
    const updates = subjectTopics.map(t => ({ id: t.id, position: nextPosition++ }))

    const supabase = createClient()
    await Promise.all(updates.map(u => supabase.from('topics').update({ day_of_week: newDay, position: u.position }).eq('id', u.id)))
    setTopics(ts => ts.map(t => {
      const u = updates.find(u => u.id === t.id)
      return u ? { ...t, day_of_week: newDay, position: u.position } : t
    }))

    const remainingInOtherPeriod = topics.some(t => t.subject_id === subjectId && t.day_of_week === activeDay && t.period !== period)
    if (!remainingInOtherPeriod) {
      setSchedules(prev => prev.filter(sc => !(sc.subject_id === subjectId && sc.day_of_week === activeDay)))
      await supabase.from('subject_schedules').delete().eq('user_id', userId).eq('subject_id', subjectId).eq('day_of_week', activeDay)
    }

    const alreadyScheduledNewDay = schedules.some(sc => sc.subject_id === subjectId && sc.day_of_week === newDay)
    if (!alreadyScheduledNewDay) {
      try {
        const { data: sc } = await supabase
          .from('subject_schedules')
          .upsert({ user_id: userId, subject_id: subjectId, day_of_week: newDay, period }, { ignoreDuplicates: true })
          .select().maybeSingle()
        if (sc) setSchedules(prev => [...prev, sc as SubjectSchedule])
      } catch { /* table may not exist yet */ }
    }
    setMovingSubject(null)
  }

  const addToSchedule = async (subjectId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('subject_schedules')
      .insert({ user_id: userId, subject_id: subjectId, day_of_week: activeDay })
      .select().single()
    if (data) setSchedules(prev => [...prev, data as SubjectSchedule])
  }

  // Switches which section (Manhã/Noite) an as-yet-empty subject sits in for
  // the active day. Only meaningful before it has any conteúdo — once topics
  // exist, each topic carries its own period and this no longer applies.
  const toggleSubjectPeriod = async (subjectId: string) => {
    const sc = schedules.find(s => s.subject_id === subjectId && s.day_of_week === activeDay)
    if (!sc) return
    const newPeriod: TopicPeriod = (sc.period ?? 'manha') === 'manha' ? 'noite' : 'manha'
    const supabase = createClient()
    await supabase.from('subject_schedules').update({ period: newPeriod }).eq('id', sc.id)
    setSchedules(prev => prev.map(s => s.id === sc.id ? { ...s, period: newPeriod } : s))
  }

  const removeFromDay = async (subjectId: string, period: TopicPeriod) => {
    const topicIds = topics
      .filter(t => t.subject_id === subjectId && t.day_of_week === activeDay && t.period === period)
      .map(t => t.id)
    const remainingInOtherPeriod = topics.some(
      t => t.subject_id === subjectId && t.day_of_week === activeDay && t.period !== period
    )

    setTopics(prev => prev.filter(t => !(t.subject_id === subjectId && t.day_of_week === activeDay && t.period === period)))
    if (!remainingInOtherPeriod) {
      setSchedules(prev => prev.filter(sc => !(sc.subject_id === subjectId && sc.day_of_week === activeDay)))
    }

    const supabase = createClient()
    await Promise.all([
      topicIds.length > 0
        ? supabase.from('topics').delete().in('id', topicIds)
        : Promise.resolve(),
      !remainingInOtherPeriod
        ? supabase.from('subject_schedules')
            .delete().eq('user_id', userId).eq('subject_id', subjectId).eq('day_of_week', activeDay)
        : Promise.resolve(),
    ])
  }

  const todayTopics           = topics.filter(t => t.day_of_week === todayDayOfWeek)
  const completedTodayMinutes = todayTopics.filter(t => t.completed).reduce((s, t) => s + t.estimated_minutes, 0)
  const totalTodayMinutes     = todayTopics.reduce((s, t) => s + t.estimated_minutes, 0)
  const sessionMinutes        = sessions.reduce((s, se) => s + se.duration_minutes, 0)

  const heatmapData = Object.entries(
    allSessions.reduce((acc, s) => {
      acc[s.date] = (acc[s.date] ?? 0) + s.duration_minutes
      return acc
    }, {} as Record<string, number>)
  ).map(([date, minutes]) => ({ date, minutes }))

  const completedCount     = topics.filter(t => t.completed && t.day_of_week !== null).length
  const dayTopics          = topics.filter(t => t.day_of_week === activeDay)
  const scheduledIdsForDay = schedules.filter(sc => sc.day_of_week === activeDay).map(sc => sc.subject_id)

  // Order subjects by when their first lesson for this period was created, so
  // the period reads in the same aula sequence it was planned in — not in the
  // fixed (unrelated) order subjects were originally added to the app.
  // A subject scheduled for the day but with no topics yet shows up once,
  // under whichever period its schedule row says (default Manhã) — never in
  // both — and can be switched via the sun/moon toggle on the empty card.
  const subjectsForPeriod = (period: TopicPeriod) => {
    const periodTopics = dayTopics.filter(t => t.period === period)
    const hasAnyTopicToday = (subjectId: string) => dayTopics.some(t => t.subject_id === subjectId)
    const scheduledPeriod = (subjectId: string) =>
      schedules.find(sc => sc.subject_id === subjectId && sc.day_of_week === activeDay)?.period ?? 'manha'
    return subjects
      .filter(s =>
        periodTopics.some(t => t.subject_id === s.id) ||
        (scheduledIdsForDay.includes(s.id) && !hasAnyTopicToday(s.id) && scheduledPeriod(s.id) === period)
      )
      .slice()
      .sort((a, b) => {
        const aFirst = periodTopics.find(t => t.subject_id === a.id)?.created_at
        const bFirst = periodTopics.find(t => t.subject_id === b.id)?.created_at
        if (aFirst && bFirst) return aFirst.localeCompare(bFirst)
        if (aFirst) return -1
        if (bFirst) return 1
        return 0
      })
  }

  return (
    <div className="page">
      {loading ? (
        <Skeleton />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <StudyHeader
            todayMinutes={completedTodayMinutes}
            goalMinutes={totalTodayMinutes}
          />
          <StudyStats
            streak={streak}
            todayMinutes={completedTodayMinutes}
            weekMinutes={sessionMinutes}
            weekGoalMinutes={0}
          />
          <div className="card">
            <StudyHeatmap data={heatmapData} completedDays={completedDays} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div className="section-header" style={{ flexWrap: 'wrap', rowGap: 8 }}>
              <h2 className="section-title">Plano de estudos</h2>
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                {completedCount > 0 && (
                  <button
                    onClick={() => { setShowResetWeek(true); openModal() }}
                    className="btn btn-ghost"
                    title="Remover conteúdo já concluído"
                    style={{ width: 'auto', minHeight: 36, padding: '0 12px', fontSize: 13 }}
                  >
                    <RotateCcw size={13} strokeWidth={2.5} />
                    Reiniciar semana
                  </button>
                )}
                <button
                  onClick={() => { setShowAddToDay(true); openModal() }}
                  className="btn btn-brand"
                  style={{ width: 'auto', minHeight: 36, padding: '0 14px', fontSize: 13 }}
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Matéria
                </button>
              </div>
            </div>

            {/* Day tabs */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {DAYS_PT.map((d, i) => {
                const active   = activeDay === i
                const hasItems = schedules.some(sc => sc.day_of_week === i) || topics.some(t => t.day_of_week === i)
                return (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    style={{
                      flexShrink: 0, height: 32, padding: '0 12px',
                      borderRadius: 'var(--r-xs)',
                      border: `1.5px solid ${active ? '#6E5CF6' : 'var(--bdr-2)'}`,
                      background: active ? '#6E5CF6' : '#fff',
                      color: active ? '#fff' : hasItems ? '#121826' : '#9BA5B4',
                      fontSize: 12, fontWeight: active ? 700 : hasItems ? 600 : 400,
                      cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                      position: 'relative',
                    }}
                  >
                    {d}
                    {hasItems && !active && (
                      <span style={{
                        position: 'absolute', top: 4, right: 4,
                        width: 4, height: 4, borderRadius: '50%', background: '#6E5CF6',
                      }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Subject cards, split into Manhã / Noite */}
            <AnimatePresence mode="popLayout">
              {PERIODS.some(p => subjectsForPeriod(p.key).length > 0) ? (
                <motion.div
                  key={activeDay}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  {PERIODS.map(({ key, label, Icon }) => {
                    const periodSubjects = subjectsForPeriod(key)
                    if (periodSubjects.length === 0) return null
                    return (
                      <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="period-header">
                          <Icon size={13} />
                          {label}
                        </div>
                        {periodSubjects.map(subject => (
                          <motion.div
                            key={subject.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                          >
                            <SubjectCard
                              subject={subject}
                              period={key}
                              topics={dayTopics
                                .filter(t => t.subject_id === subject.id && t.period === key)
                                .sort((a, b) => a.position - b.position)}
                              sessionMinutes={0}
                              onToggleTopic={toggleTopic}
                              onAddTopic={addTopic}
                              onDeleteTopic={deleteTopic}
                              onRemoveFromDay={() => removeFromDay(subject.id, key)}
                              onEditSubject={() => { setEditingSubject(subject); openModal() }}
                              onMoveSubject={() => { setMovingSubject({ subject, period: key }); openModal() }}
                              onReorderTopics={reorderTopics}
                              onTogglePeriod={togglePeriod}
                              onToggleSubjectPeriod={() => toggleSubjectPeriod(subject.id)}
                              onEditTopic={editTopic}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key={`empty-${activeDay}`}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ textAlign: 'center', padding: '32px 0' }}
                >
                  <p style={{ fontSize: 13, color: '#9BA5B4', marginBottom: 16 }}>
                    Nenhuma matéria neste dia
                  </p>
                  <button
                    onClick={() => { setShowAddToDay(true); openModal() }}
                    className="btn"
                    style={{
                      width: 'auto', padding: '0 20px', minHeight: 36,
                      border: '1.5px dashed var(--bdr-2)', background: 'transparent',
                      fontSize: 13, color: '#6E5CF6', fontWeight: 600,
                    }}
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    Adicionar matéria
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Sheets */}
      <AnimatePresence>
        {showResetWeek && (
          <ResetWeekSheet
            count={completedCount}
            onConfirm={resetWeek}
            onClose={() => { setShowResetWeek(false); closeModal() }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {movingSubject && (
          <MoveSubjectSheet
            subject={movingSubject.subject}
            currentDay={activeDay}
            onSelectDay={day => moveSubjectToDay(movingSubject.subject.id, movingSubject.period, day)}
            onClose={() => { setMovingSubject(null); closeModal() }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddToDay && (
          <AddToDaySheet
            day={activeDay}
            subjects={subjects}
            scheduledIds={scheduledIdsForDay}
            onClose={() => { setShowAddToDay(false); closeModal() }}
            onAdd={addToSchedule}
            onCreateNew={() => { setShowAdd(true); openModal() }}
            onDeleteSubject={deleteSubject}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shareData && (
          <ShareReveal
            dateLabel={DAYS_FULL[todayDayOfWeek]}
            streak={shareData.streak}
            totalMinutes={shareData.totalMinutes}
            subjects={shareData.subjects}
            phrase={shareData.phrase}
            onClose={() => { setShareData(null); closeModal() }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <SubjectSheet
            userId={userId}
            onClose={() => { setShowAdd(false); closeModal() }}
            onEdit={() => {}}
            onAdd={async s => {
              setSubjects(prev => [...prev, s])
              const supabase = createClient()
              const { data } = await supabase
                .from('subject_schedules')
                .insert({ user_id: userId, subject_id: s.id, day_of_week: activeDay })
                .select().single()
              if (data) setSchedules(prev => [...prev, data as SubjectSchedule])
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingSubject && (
          <SubjectSheet
            userId={userId}
            subject={editingSubject}
            onClose={() => { setEditingSubject(null); closeModal() }}
            onAdd={() => {}}
            onEdit={s => setSubjects(prev => prev.map(sub => sub.id === s.id ? s : sub))}
            onDelete={deleteSubject}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
