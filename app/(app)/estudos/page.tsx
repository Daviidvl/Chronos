import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO, calcStreak, nextReviewInterval } from '@/lib/utils'
import { useModal } from '@/lib/modal-context'
import { StudyHeader }  from '@/components/estudos/StudyHeader'
import { StudyStats }   from '@/components/estudos/StudyStats'
import { SubjectCard }  from '@/components/estudos/SubjectCard'
import { PomodoroTimer } from '@/components/estudos/PomodoroTimer'
import { RevisionList } from '@/components/estudos/RevisionList'
import type { Subject, Topic, StudySession } from '@/types'
import { format, addDays } from 'date-fns'

const PALETTE = [
  '#6E5CF6', '#2563EB', '#2CC08C', '#F79009',
  '#F04438', '#EC4899', '#0EA5E9', '#8B5CF6',
]

function AddSubjectSheet({
  onClose, onAdd, userId,
}: {
  onClose: () => void
  onAdd: (s: Subject) => void
  userId: string
}) {
  const [name, setName]     = useState('')
  const [color, setColor]   = useState(PALETTE[0])
  const [goal, setGoal]     = useState('60')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const icon = name.trim().charAt(0).toUpperCase()
    const { data, error } = await supabase
      .from('subjects')
      .insert({ user_id: userId, name: name.trim(), color, icon, daily_goal_minutes: parseInt(goal) || 60 })
      .select()
      .single()
    if (!error && data) { onAdd(data as Subject); onClose() }
    setSaving(false)
  }

  const preview = name.trim().charAt(0).toUpperCase() || 'A'

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
            Nova matéria
          </span>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Preview */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: 16,
              background: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff',
              letterSpacing: '-0.5px',
              boxShadow: `0 4px 16px ${color}40`,
            }}>
              {preview}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Nome</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Matemática, Inglês…"
              className="field"
              style={{ marginTop: 6 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">Cor</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`color-swatch${color === c ? ' color-swatch--active' : ''}`}
                  style={{ background: c, outlineColor: c }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">Meta diária (minutos)</label>
            <input
              type="number"
              min="15"
              max="480"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              className="field field-sm"
              style={{ marginTop: 6 }}
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="btn btn-brand"
            style={{ background: color }}
          >
            {saving ? 'A guardar…' : `Adicionar ${name || 'matéria'}`}
          </button>
        </form>
      </motion.div>
    </>
  )
}

function StudySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skel" style={{ height: 180, borderRadius: 'var(--r-lg)' }} />
      <div className="stat-grid">
        {[1,2,3].map(i => (
          <div key={i} className="skel" style={{ height: 90, borderRadius: 'var(--r)' }} />
        ))}
      </div>
      <div className="skel" style={{ height: 220, borderRadius: 'var(--r-lg)' }} />
      {[1,2].map(i => (
        <div key={i} className="skel" style={{ height: 100, borderRadius: 'var(--r)' }} />
      ))}
    </div>
  )
}

export default function EstudosPage() {
  const [subjects,   setSubjects]   = useState<Subject[]>([])
  const [topics,     setTopics]     = useState<Topic[]>([])
  const [sessions,   setSessions]   = useState<StudySession[]>([])
  const [revisions,  setRevisions]  = useState<Topic[]>([])
  const [streak,     setStreak]     = useState(0)
  const [userId,     setUserId]     = useState('')
  const [showAdd,    setShowAdd]    = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [activeDay,  setActiveDay]  = useState(() => (new Date().getDay() + 6) % 7)

  const { open: openModal, close: closeModal } = useModal()

  const handleSessionSaved = useCallback((s: StudySession) => {
    setSessions(prev => [...prev, s])
  }, [])
  const today = todayISO()

  const load = useCallback(async () => {
    try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    const sixtyAgo = format(addDays(new Date(), -60), 'yyyy-MM-dd')

    const [
      { data: subjectsData },
      { data: topicsData },
      { data: sessionsData },
      { data: revisionsData },
      { data: streakData },
    ] = await Promise.all([
      supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('topics').select('*, subject:subjects(*)').eq('user_id', user.id).order('created_at'),
      supabase.from('study_sessions').select('*').eq('user_id', user.id).eq('date', today),
      supabase
        .from('topics')
        .select('*, subject:subjects(*)')
        .eq('user_id', user.id)
        .eq('completed', true)
        .lte('review_date', today)
        .not('review_date', 'is', null),
      supabase
        .from('study_sessions')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', sixtyAgo),
    ])

    setSubjects((subjectsData as Subject[]) ?? [])
    setTopics((topicsData as Topic[]) ?? [])
    setSessions((sessionsData as StudySession[]) ?? [])
    setRevisions((revisionsData as Topic[]) ?? [])
    setStreak(calcStreak((streakData ?? []).map((r: { date: string }) => r.date)))
    } catch (e) { console.error('load error:', e) } finally { setLoading(false) }
  }, [today])

  useEffect(() => { load() }, [load])

  const toggleTopic = async (topic: Topic, done: boolean) => {
    const supabase = createClient()
    const updates: Partial<Topic> = {
      completed:    done,
      completed_at: done ? new Date().toISOString() : null,
      review_date:  done ? format(addDays(new Date(), 1), 'yyyy-MM-dd') : null,
      review_interval: done ? 1 : null,
    }
    await supabase.from('topics').update(updates).eq('id', topic.id)
    setTopics(ts => ts.map(t => t.id === topic.id ? { ...t, ...updates } : t))
  }

  const addTopic = async (subjectId: string, title: string, estimatedMinutes: number) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('topics')
      .insert({ user_id: userId, subject_id: subjectId, title, estimated_minutes: estimatedMinutes, day_of_week: activeDay })
      .select('*, subject:subjects(*)')
      .single()
    if (data) setTopics(ts => [...ts, data as Topic])
  }

  const deleteSubject = async (id: string) => {
    const supabase = createClient()
    await supabase.from('subjects').delete().eq('id', id)
    setSubjects(ss => ss.filter(s => s.id !== id))
    setTopics(ts => ts.filter(t => t.subject_id !== id))
  }

  const markReviewed = async (topic: Topic) => {
    const next     = nextReviewInterval(topic.review_interval)
    const nextDate = format(addDays(new Date(), next), 'yyyy-MM-dd')
    const supabase = createClient()
    await supabase.from('topics').update({ review_interval: next, review_date: nextDate }).eq('id', topic.id)
    setRevisions(rs => rs.filter(r => r.id !== topic.id))
    setTopics(ts => ts.map(t => t.id === topic.id ? { ...t, review_interval: next, review_date: nextDate } : t))
  }

  const todayMinutes  = sessions.reduce((sum, s) => sum + s.duration_minutes, 0)
  const goalMinutes   = subjects.reduce((sum, s) => sum + s.daily_goal_minutes, 0)
  const weekMinutes   = todayMinutes
  const weekGoal      = goalMinutes * 5

  const sessionsBySubject = (subjectId: string) =>
    sessions.filter(s => s.subject_id === subjectId)
      .reduce((sum, s) => sum + s.duration_minutes, 0)

  const dayTopics = topics.filter(t => t.day_of_week === activeDay)
  const hasContentForDay = dayTopics.length > 0
  // When day has content: show only subjects with topics for this day
  // When day is empty: show all subjects so user can add content
  const subjectsForDay = hasContentForDay
    ? subjects.filter(s => dayTopics.some(t => t.subject_id === s.id))
    : subjects

  return (
    <div className="page">
      {loading ? (
        <StudySkeleton />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          <StudyHeader todayMinutes={todayMinutes} goalMinutes={goalMinutes} />

          <StudyStats
            streak={streak}
            todayMinutes={todayMinutes}
            weekMinutes={weekMinutes}
            weekGoalMinutes={weekGoal}
          />

          <PomodoroTimer
            subjects={subjects}
            userId={userId}
            onSessionSaved={handleSessionSaved}
          />

          {revisions.length > 0 && (
            <RevisionList topics={revisions} onReview={markReviewed} />
          )}

          <div>
            <div className="section-header" style={{ marginBottom: 14 }}>
              <h2 className="section-title">Plano de estudos</h2>
              <button
                onClick={() => { setShowAdd(true); openModal() }}
                className="btn btn-brand"
                style={{ width: 'auto', minHeight: 36, padding: '0 14px', fontSize: 13 }}
              >
                <Plus size={14} strokeWidth={2.5} />
                Matéria
              </button>
            </div>

            {/* Abas de dia */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
              {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((d, i) => {
                const active   = activeDay === i
                const hasItems = topics.some(t => t.day_of_week === i)
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

            {/* Matérias do dia */}
            {subjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <button
                  onClick={() => { setShowAdd(true); openModal() }}
                  className="btn btn-brand"
                  style={{ width: 'auto', padding: '0 28px' }}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Adicionar matéria
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {subjectsForDay.length > 0 ? (
                  <motion.div
                    key={activeDay}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                  >
                    {subjectsForDay.map(subject => (
                      <motion.div
                        key={subject.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                      >
                        <SubjectCard
                          subject={subject}
                          topics={dayTopics.filter(t => t.subject_id === subject.id)}
                          sessionMinutes={sessionsBySubject(subject.id)}
                          onToggleTopic={toggleTopic}
                          onAddTopic={addTopic}
                          onDelete={deleteSubject}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${activeDay}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    {subjects.map(s => (
                      <SubjectCard
                        key={s.id}
                        subject={s}
                        topics={[]}
                        sessionMinutes={0}
                        onToggleTopic={toggleTopic}
                        onAddTopic={addTopic}
                        onDelete={deleteSubject}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddSubjectSheet
            onClose={() => { setShowAdd(false); closeModal() }}
            onAdd={s => setSubjects(prev => [...prev, s])}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
