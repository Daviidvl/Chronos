import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Timer, Maximize2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO } from '@/lib/utils'
import type { Subject, StudySession } from '@/types'
import { AmbientPlayer } from './AmbientPlayer'
import { PomodoroFullscreen } from './PomodoroFullscreen'

type Phase = 'idle' | 'study' | 'break'

interface Props {
  subjects: Subject[]
  userId: string
  onSessionSaved: (s: StudySession) => void
}

export function PomodoroTimer({ subjects, userId, onSessionSaved }: Props) {
  const [phase, setPhase]         = useState<Phase>('idle')
  const [studyMins, setStudyMins] = useState(25)
  const [breakMins, setBreakMins] = useState(5)
  const [seconds, setSeconds]     = useState(25 * 60)
  const [running, setRunning]     = useState(false)
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [cycles, setCycles]       = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef  = useRef<BroadcastChannel | null>(null)
  const widgetRef   = useRef<Window | null>(null)

  const studySecs = studyMins * 60
  const breakSecs = breakMins * 60
  const total = phase === 'break' ? breakSecs : studySecs
  const pct   = Math.round(((total - seconds) / total) * 100)

  // Open BroadcastChannel once
  useEffect(() => {
    try { channelRef.current = new BroadcastChannel('chronos-pomodoro') } catch {}
    return () => channelRef.current?.close()
  }, [])

  // Broadcast state on every relevant change
  useEffect(() => {
    channelRef.current?.postMessage({ seconds, phase, studyMins, breakMins, cycles, running })
  }, [seconds, phase, studyMins, breakMins, cycles, running])

  const saveSession = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('study_sessions')
      .insert({ user_id: userId, subject_id: subjectId, date: todayISO(), duration_minutes: studyMins })
      .select()
      .single()
    if (data) onSessionSaved(data as StudySession)
  }, [userId, subjectId, onSessionSaved, studyMins])

  const phaseComplete = useCallback(async () => {
    setRunning(false)
    if (phase === 'study') {
      await saveSession()
      setCycles(c => c + 1)
      setPhase('break')
      setSeconds(breakSecs)
    } else {
      setPhase('study')
      setSeconds(studySecs)
    }
  }, [phase, saveSession, breakSecs, studySecs])

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(timerRef.current!); return 0 }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current!)
    }
    return () => clearInterval(timerRef.current!)
  }, [running])

  useEffect(() => {
    if (seconds === 0 && !running) phaseComplete()
  }, [seconds, running, phaseComplete])

  const start = () => {
    if (phase === 'idle') setPhase('study')
    setRunning(true)
  }

  const reset = () => {
    setRunning(false)
    setSeconds(studySecs)
    setPhase('idle')
  }

  const openWidget = () => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '')
    const url  = `${window.location.origin}${base}/widget`
    if (widgetRef.current && !widgetRef.current.closed) {
      widgetRef.current.focus()
    } else {
      widgetRef.current = window.open(
        url,
        'chronos-widget',
        'width=300,height=200,location=no,menubar=no,toolbar=no,scrollbars=no,resizable=yes',
      )
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const phaseColor = phase === 'break' ? '#2CC08C' : '#2563EB'
  const phaseLabel = phase === 'break' ? 'Pausa' : phase === 'idle' ? 'Pronto' : 'Foco'

  return (
    <>
      {fullscreen && (
        <PomodoroFullscreen
          seconds={seconds}
          phase={phase}
          studyMins={studyMins}
          breakMins={breakMins}
          cycles={cycles}
          onClose={() => setFullscreen(false)}
        />
      )}

      <div className="pomodoro-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Timer size={18} style={{ color: phaseColor }} />
          <p style={{ fontSize: 14, fontWeight: 700, color: '#121826', letterSpacing: '-0.2px', flex: 1 }}>
            Pomodoro
          </p>
          {cycles > 0 && (
            <span className="badge-pill" style={{ background: '#EDE9FE', color: '#6E5CF6' }}>
              {cycles} {cycles === 1 ? 'ciclo' : 'ciclos'}
            </span>
          )}
          <button
            onClick={openWidget}
            className="btn-icon"
            title="Abrir widget em popup"
            style={{ color: '#9BA5B4' }}
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="btn-icon"
            title="Modo tela cheia"
            style={{ color: '#9BA5B4' }}
          >
            <Maximize2 size={14} />
          </button>
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

        {/* Duration inputs — only when idle */}
        {phase === 'idle' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Foco (min)</label>
              <input
                type="number" min="1" max="120"
                value={studyMins}
                onChange={e => {
                  const v = Math.max(1, parseInt(e.target.value) || 25)
                  setStudyMins(v)
                  setSeconds(v * 60)
                }}
                className="field field-sm"
                style={{ marginTop: 4 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Pausa (min)</label>
              <input
                type="number" min="1" max="60"
                value={breakMins}
                onChange={e => setBreakMins(Math.max(1, parseInt(e.target.value) || 5))}
                className="field field-sm"
                style={{ marginTop: 4 }}
              />
            </div>
          </div>
        )}

        {/* Phase label */}
        <p className="pomodoro-phase" style={{ color: phaseColor }}>
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
        <div className="pomodoro-track" style={{ background: phaseColor + '18' }}>
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

        {/* Ambient audio player */}
        <AmbientPlayer />
      </div>
    </>
  )
}
