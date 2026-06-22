'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Timer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO } from '@/lib/utils'
import type { Subject, StudySession } from '@/types'

const STUDY_SECS = 25 * 60
const BREAK_SECS = 5 * 60

type Phase = 'idle' | 'study' | 'break'

interface Props {
  subjects: Subject[]
  userId: string
  onSessionSaved: (s: StudySession) => void
}

export function PomodoroTimer({ subjects, userId, onSessionSaved }: Props) {
  const [phase, setPhase]     = useState<Phase>('idle')
  const [seconds, setSeconds] = useState(STUDY_SECS)
  const [running, setRunning] = useState(false)
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [cycles, setCycles]   = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = phase === 'break' ? BREAK_SECS : STUDY_SECS
  const pct   = Math.round(((total - seconds) / total) * 100)

  const saveSession = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('study_sessions')
      .insert({ user_id: userId, subject_id: subjectId, date: todayISO(), duration_minutes: 25 })
      .select()
      .single()
    if (data) onSessionSaved(data as StudySession)
  }, [userId, subjectId, onSessionSaved])

  const phaseComplete = useCallback(async () => {
    setRunning(false)
    if (phase === 'study') {
      await saveSession()
      setCycles(c => c + 1)
      setPhase('break')
      setSeconds(BREAK_SECS)
    } else {
      setPhase('study')
      setSeconds(STUDY_SECS)
    }
  }, [phase, saveSession])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(timerRef.current!)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current!)
    }
    return () => clearInterval(timerRef.current!)
  }, [running])

  useEffect(() => {
    if (seconds === 0 && !running) {
      phaseComplete()
    }
  }, [seconds, running, phaseComplete])

  const start = () => {
    if (phase === 'idle') setPhase('study')
    setRunning(true)
  }

  const reset = () => {
    setRunning(false)
    setSeconds(STUDY_SECS)
    setPhase('idle')
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const phaseColor = phase === 'break' ? '#2CC08C' : '#2563EB'
  const phaseLabel = phase === 'break' ? 'Pausa' : phase === 'idle' ? 'Pronto' : 'Foco'

  return (
    <div className="pomodoro-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Timer size={18} style={{ color: phaseColor }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#121826', letterSpacing: '-0.2px' }}>
          Pomodoro
        </p>
        {cycles > 0 && (
          <span
            className="badge-pill"
            style={{ background: '#EDE9FE', color: '#6E5CF6', marginLeft: 'auto' }}
          >
            {cycles} {cycles === 1 ? 'ciclo' : 'ciclos'}
          </span>
        )}
      </div>

      {/* Subject selector */}
      {subjects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Estudando</label>
          <select
            value={subjectId ?? ''}
            onChange={e => setSubjectId(e.target.value || null)}
            className="field field-sm"
            style={{ marginTop: 6 }}
          >
            <option value="">Sem matéria</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Phase label */}
      <p
        className="pomodoro-phase"
        style={{ color: phaseColor }}
      >
        {phaseLabel}
      </p>

      {/* Timer display */}
      <motion.p
        key={phase}
        className="pomodoro-display"
        style={{ color: phaseColor }}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {mm}:{ss}
      </motion.p>

      {/* Progress bar */}
      <div
        className="pomodoro-track"
        style={{ background: phaseColor + '18' }}
      >
        <motion.div
          className="pomodoro-fill"
          style={{ background: phaseColor, width: `${pct}%` }}
        />
      </div>

      {/* Controls */}
      <div className="pomodoro-btn-row">
        <button
          onClick={running ? () => setRunning(false) : start}
          className="btn btn-brand"
          style={{ background: phaseColor, boxShadow: `0 8px 24px ${phaseColor}40` }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {running ? (
              <motion.span
                key="pause"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Pause size={16} /> Pausar
              </motion.span>
            ) : (
              <motion.span
                key="play"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Play size={16} /> {phase === 'idle' ? 'Iniciar' : 'Continuar'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={reset}
          className="btn btn-ghost"
          style={{ width: 'auto', padding: '0 18px' }}
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  )
}
