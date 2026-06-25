import { useState, useEffect } from 'react'

type Phase = 'idle' | 'study' | 'break'
type WidgetMode = 'compact' | 'standard' | 'minimal'

interface TimerState {
  seconds:   number
  phase:     Phase
  studyMins: number
  breakMins: number
  cycles:    number
  running:   boolean
}

const DEFAULT: TimerState = { seconds: 25 * 60, phase: 'idle', studyMins: 25, breakMins: 5, cycles: 0, running: false }

export default function WidgetPage() {
  const [state,     setState]     = useState<TimerState>(DEFAULT)
  const [mode,      setMode]      = useState<WidgetMode>('compact')
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel('chronos-pomodoro')
      channel.onmessage = (e: MessageEvent<TimerState>) => {
        setState(e.data)
        setConnected(true)
      }
    } catch {}
    return () => channel?.close()
  }, [])

  const mm = String(Math.floor(state.seconds / 60)).padStart(2, '0')
  const ss = String(state.seconds % 60).padStart(2, '0')
  const color = state.phase === 'break' ? '#2CC08C' : '#6E5CF6'
  const label = state.phase === 'break' ? 'Pausa' : state.phase === 'idle' ? 'Aguardando' : 'Foco'

  const modeBtn = (m: WidgetMode) => ({
    fontSize: 9, padding: '3px 7px', borderRadius: 4, border: 'none',
    background: mode === m ? '#ffffff20' : 'transparent',
    color: mode === m ? '#ffffffcc' : '#ffffff40',
    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
  } as React.CSSProperties)

  return (
    <div style={{
      minHeight: '100dvh', background: '#080c14',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#fff', userSelect: 'none', overflow: 'hidden',
      padding: 16,
    }}>
      {/* Mode switcher */}
      <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 2 }}>
        <button style={modeBtn('compact')}  onClick={() => setMode('compact')}>C</button>
        <button style={modeBtn('standard')} onClick={() => setMode('standard')}>S</button>
        <button style={modeBtn('minimal')}  onClick={() => setMode('minimal')}>M</button>
      </div>

      {mode === 'minimal' && (
        <p style={{ fontSize: '4rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color, margin: 0, letterSpacing: '-0.02em' }}>
          {mm}:{ss}
        </p>
      )}

      {mode === 'compact' && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '3.2rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color, margin: 0, letterSpacing: '-0.02em' }}>
            {mm}:{ss}
          </p>
          <p style={{ fontSize: 11, color: '#ffffff55', margin: '6px 0 0', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {label}
          </p>
          {!connected && (
            <p style={{ fontSize: 9, color: '#ffffff30', margin: '4px 0 0' }}>Abra o Chronos para sincronizar</p>
          )}
        </div>
      )}

      {mode === 'standard' && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: color + 'aa', margin: '0 0 8px' }}>
            {label}
          </p>
          <p style={{ fontSize: '2.8rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color, margin: 0, letterSpacing: '-0.02em' }}>
            {mm}:{ss}
          </p>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 16 }}>
            <span style={{ fontSize: 10, color: '#ffffff40', fontWeight: 600 }}>
              {state.cycles} ciclo{state.cycles !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: 10, color: '#ffffff40', fontWeight: 600 }}>
              {state.running ? 'Correndo' : 'Pausado'}
            </span>
          </div>
          {!connected && (
            <p style={{ fontSize: 9, color: '#F79009aa', margin: '8px 0 0', fontWeight: 600 }}>
              Abra o Chronos para sincronizar
            </p>
          )}
        </div>
      )}
    </div>
  )
}
