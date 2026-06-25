import { useState, useEffect, useRef } from 'react'
import { X, LayoutGrid } from 'lucide-react'

type Phase = 'idle' | 'study' | 'break'
type Mode  = 'focus-dark' | 'minimal' | 'flip-clock' | 'ambient'

interface Props {
  seconds: number
  phase: Phase
  studyMins: number
  breakMins: number
  cycles: number
  onClose: () => void
}

// --- Flip clock digit with CSS 3D transform ---
function FlipDigit({ digit }: { digit: string }) {
  const [cur,  setCur]  = useState(digit)
  const [prev, setPrev] = useState(digit)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    if (digit !== cur) {
      setPrev(cur)
      setFlip(true)
      const t = setTimeout(() => { setCur(digit); setFlip(false) }, 180)
      return () => clearTimeout(t)
    }
  }, [digit, cur])

  const card: React.CSSProperties = {
    width: 96, height: 130,
    background: '#1a1f2e',
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 90, fontWeight: 700, color: '#fff',
    fontVariantNumeric: 'tabular-nums',
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    overflow: 'hidden', position: 'relative',
    transform: flip ? 'scale(0.96)' : 'scale(1)',
    opacity: flip ? 0.7 : 1,
    transition: 'transform 0.18s ease, opacity 0.18s ease',
    userSelect: 'none',
  }

  return <div style={card}>{cur}</div>
}

function FlipClock({ mm, ss, color }: { mm: string; ss: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <FlipDigit digit={mm[0]} />
      <FlipDigit digit={mm[1]} />
      <span style={{ fontSize: 80, fontWeight: 700, color, marginBottom: 8, lineHeight: 1, userSelect: 'none' }}>:</span>
      <FlipDigit digit={ss[0]} />
      <FlipDigit digit={ss[1]} />
    </div>
  )
}

// --- Ambient animated background ---
function useAmbientGradient(phase: Phase) {
  const [angle, setAngle] = useState(135)
  const rafRef = useRef<number>(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000
      setAngle(135 + Math.sin(elapsed * 0.3) * 30)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current!)
  }, [])

  if (phase === 'break') {
    return `linear-gradient(${angle}deg, #0d2318 0%, #0a2e20 40%, #0c3d2b 100%)`
  }
  return `linear-gradient(${angle}deg, #0d0f1e 0%, #121432 40%, #1a1060 100%)`
}

const MODES: { id: Mode; label: string }[] = [
  { id: 'focus-dark', label: 'Focus' },
  { id: 'minimal',    label: 'Minimal' },
  { id: 'flip-clock', label: 'Flip' },
  { id: 'ambient',    label: 'Ambient' },
]

export function PomodoroFullscreen({ seconds, phase, cycles, onClose }: Props) {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem('fs-mode') as Mode) || 'focus-dark')
  const [showModes, setShowModes] = useState(false)
  const ambientBg = useAmbientGradient(phase)

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const phaseColor = phase === 'break' ? '#2CC08C' : '#6E5CF6'
  const phaseLabel = phase === 'break' ? 'Pausa' : phase === 'idle' ? 'Pronto' : 'Foco'

  const setAndSaveMode = (m: Mode) => {
    setMode(m)
    localStorage.setItem('fs-mode', m)
    setShowModes(false)
  }

  // Escape key closes
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onClose])

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'inherit',
  }

  const controls: React.CSSProperties = {
    position: 'absolute', top: 20, right: 20,
    display: 'flex', gap: 8,
  }

  const iconBtn = (bg = '#ffffff15', hoverBg = '#ffffff25'): React.CSSProperties => ({
    background: bg, border: 'none', borderRadius: 8,
    padding: 10, cursor: 'pointer', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
  })

  // --- Focus Dark ---
  if (mode === 'focus-dark') {
    return (
      <div style={{ ...overlay, background: '#07090f' }}>
        <TopControls onClose={onClose} onModeToggle={() => setShowModes(v => !v)} showModes={showModes} mode={mode} onModeChange={setAndSaveMode} />
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: phaseColor, marginBottom: 24 }}>
          {phaseLabel}
        </p>
        <p style={{
          fontSize: 'clamp(90px, 20vw, 220px)',
          fontWeight: 700, color: '#fff', margin: 0,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
          textShadow: `0 0 60px ${phaseColor}60`,
          lineHeight: 1,
        }}>
          {mm}:{ss}
        </p>
        {cycles > 0 && (
          <p style={{ marginTop: 24, fontSize: 12, color: '#ffffff40', letterSpacing: '0.1em' }}>
            {cycles} {cycles === 1 ? 'ciclo' : 'ciclos'} concluídos
          </p>
        )}
      </div>
    )
  }

  // --- Minimal ---
  if (mode === 'minimal') {
    return (
      <div style={{ ...overlay, background: '#F7F8FC' }}>
        <TopControls onClose={onClose} onModeToggle={() => setShowModes(v => !v)} showModes={showModes} mode={mode} onModeChange={setAndSaveMode} dark={false} />
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: phaseColor, marginBottom: 20 }}>
          {phaseLabel}
        </p>
        <p style={{
          fontSize: 'clamp(80px, 18vw, 200px)',
          fontWeight: 800, color: '#121826', margin: 0,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em', lineHeight: 1,
        }}>
          {mm}:{ss}
        </p>
      </div>
    )
  }

  // --- Flip Clock ---
  if (mode === 'flip-clock') {
    return (
      <div style={{ ...overlay, background: '#111827' }}>
        <TopControls onClose={onClose} onModeToggle={() => setShowModes(v => !v)} showModes={showModes} mode={mode} onModeChange={setAndSaveMode} />
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: phaseColor, marginBottom: 32 }}>
          {phaseLabel}
        </p>
        <FlipClock mm={mm} ss={ss} color={phaseColor} />
        {cycles > 0 && (
          <p style={{ marginTop: 28, fontSize: 12, color: '#ffffff40', letterSpacing: '0.08em' }}>
            {cycles} {cycles === 1 ? 'ciclo' : 'ciclos'}
          </p>
        )}
      </div>
    )
  }

  // --- Ambient ---
  return (
    <div style={{ ...overlay, background: ambientBg, transition: 'background 2s ease' }}>
      <TopControls onClose={onClose} onModeToggle={() => setShowModes(v => !v)} showModes={showModes} mode={mode} onModeChange={setAndSaveMode} />
      <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: phaseColor + 'cc', marginBottom: 24 }}>
        {phaseLabel}
      </p>
      <p style={{
        fontSize: 'clamp(80px, 18vw, 200px)',
        fontWeight: 700, color: '#ffffffee', margin: 0,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1,
        textShadow: '0 4px 40px rgba(0,0,0,0.4)',
      }}>
        {mm}:{ss}
      </p>
      {cycles > 0 && (
        <p style={{ marginTop: 24, fontSize: 12, color: '#ffffff60', letterSpacing: '0.1em' }}>
          {cycles} {cycles === 1 ? 'ciclo' : 'ciclos'}
        </p>
      )}
    </div>
  )
}

// --- Shared top control bar ---
interface TopControlsProps {
  onClose: () => void
  onModeToggle: () => void
  showModes: boolean
  mode: Mode
  onModeChange: (m: Mode) => void
  dark?: boolean
}

function TopControls({ onClose, onModeToggle, showModes, mode, onModeChange, dark = true }: TopControlsProps) {
  const fg = dark ? '#fff' : '#121826'
  const bg = dark ? '#ffffff15' : '#12182610'

  return (
    <>
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        <button
          onClick={onModeToggle}
          style={{ background: bg, border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: fg, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontSize: 12, fontWeight: 600 }}
        >
          <LayoutGrid size={14} />
          {MODES.find(m2 => m2.id === mode)?.label}
        </button>
        <button
          onClick={onClose}
          style={{ background: bg, border: 'none', borderRadius: 8, padding: 9, cursor: 'pointer', color: fg, display: 'flex' }}
          title="Fechar (Esc)"
        >
          <X size={15} />
        </button>
      </div>

      {showModes && (
        <div style={{
          position: 'absolute', top: 60, right: 20,
          background: dark ? '#1e2433' : '#fff',
          borderRadius: 10, padding: 6, display: 'flex', flexDirection: 'column', gap: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          zIndex: 1,
        }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => onModeChange(m.id)} style={{
              padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: mode === m.id ? '#6E5CF6' : 'transparent',
              color: mode === m.id ? '#fff' : (dark ? '#ffffffaa' : '#121826'),
              fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
              textAlign: 'left', transition: 'background 0.12s',
            }}>
              {m.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
