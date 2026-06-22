import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO, formatMinutes } from '@/lib/utils'
import type { Subject, StudySession } from '@/types'

export function TodayStudyCard() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: subjectsData },
        { data: sessionsData },
      ] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at').limit(5),
        supabase.from('study_sessions').select('*').eq('user_id', user.id).eq('date', todayISO()),
      ])

      setSubjects((subjectsData as Subject[]) ?? [])
      setSessions((sessionsData as StudySession[]) ?? [])
      setLoading(false)
    })()
  }, [])

  const todayMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0)
  const goalMinutes  = subjects.reduce((sum, s) => sum + s.daily_goal_minutes, 0)
  const pct = goalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / goalMinutes) * 100)) : 0

  if (loading) {
    return (
      <div className="skel" style={{ height: 90, borderRadius: 'var(--r-lg)' }} />
    )
  }

  return (
    <motion.div
      className="study-today-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="study-today-header">
        <div className="study-today-icon">
          <BookOpen size={18} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#121826', letterSpacing: '-0.2px' }}>
            Estudos de hoje
          </p>
          {subjects.length > 0 && (
            <p style={{ fontSize: 12, color: '#9BA5B4', marginTop: 1 }}>
              {subjects.length} {subjects.length === 1 ? 'matéria' : 'matérias'} · {formatMinutes(todayMinutes)} estudados
            </p>
          )}
        </div>
        <Link to="/estudos" className="btn-icon" style={{ color: '#2563EB' }}>
          <ArrowRight size={17} />
        </Link>
      </div>

      {subjects.length === 0 ? (
        /* Empty */
        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
          <p style={{ fontSize: 13, color: '#9BA5B4', marginBottom: 10 }}>
            Nenhuma matéria cadastrada ainda.
          </p>
          <Link
            to="/estudos"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#2563EB',
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            Adicionar matéria
          </Link>
        </div>
      ) : (
        <>
          {/* Subject pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {subjects.slice(0, 4).map(s => (
              <span
                key={s.id}
                className="badge"
                style={{ background: s.color + '15', color: s.color }}
              >
                {s.icon} {s.name}
              </span>
            ))}
            {subjects.length > 4 && (
              <span className="badge" style={{ background: '#F2F4FA', color: '#9BA5B4' }}>
                +{subjects.length - 4}
              </span>
            )}
          </div>

          {/* Progress */}
          {goalMinutes > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#9BA5B4' }}>
                  {formatMinutes(todayMinutes)} / {formatMinutes(goalMinutes)}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#2563EB' }}>{pct}%</span>
              </div>
              <div className="progress-track" style={{ background: 'rgba(37,99,235,0.08)' }}>
                <motion.div
                  style={{
                    height: '100%', borderRadius: 99,
                    background: 'linear-gradient(to right, #2563EB, #60A5FA)',
                    width: `${pct}%`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </>
          )}

          <Link
            to="/estudos"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              marginTop: 14, fontSize: 13, fontWeight: 600, color: '#2563EB',
              padding: '8px',
              borderRadius: 'var(--r-xs)',
              background: 'rgba(37,99,235,0.06)',
            }}
          >
            <BookOpen size={13} />
            Ver plano completo
          </Link>
        </>
      )}
    </motion.div>
  )
}
