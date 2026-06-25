import { useState, useEffect, useRef } from 'react'
import { Music, CloudRain, Wind, Coffee, Leaf, Brain, BookMarked, Music2, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react'

interface Track {
  id: string
  name: string
  icon: React.ReactNode
  type: 'stream' | 'generated'
  url?: string
}

const TRACKS: Track[] = [
  { id: 'lofi',    name: 'LoFi Study',    icon: <Music size={13} />,     type: 'stream',    url: 'https://ice2.somafm.com/groovesalad-128-mp3' },
  { id: 'deep',    name: 'Deep Focus',    icon: <Brain size={13} />,     type: 'stream',    url: 'https://ice2.somafm.com/deepspaceone-128-mp3' },
  { id: 'piano',   name: 'Ambient Piano', icon: <Music2 size={13} />,    type: 'stream',    url: 'https://ice2.somafm.com/sleep-128-mp3' },
  { id: 'rain',    name: 'Rain',          icon: <CloudRain size={13} />, type: 'generated' },
  { id: 'coffee',  name: 'Coffee Shop',   icon: <Coffee size={13} />,    type: 'stream',    url: 'https://ice2.somafm.com/lush-128-mp3' },
  { id: 'library', name: 'Library',       icon: <BookMarked size={13} />,type: 'generated' },
  { id: 'forest',  name: 'Forest',        icon: <Leaf size={13} />,      type: 'generated' },
  { id: 'white',   name: 'White Noise',   icon: <Wind size={13} />,      type: 'generated' },
]

function makeNoiseBuffer(ctx: AudioContext, kind: 'white' | 'brown'): AudioBuffer {
  const duration = 12
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buf.getChannelData(0)
  if (kind === 'white') {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  } else {
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1
      data[i] = (last + 0.02 * w) / 1.02
      last = data[i]
      data[i] *= 3.5
    }
  }
  return buf
}

function startGenerated(ctx: AudioContext, gain: GainNode, id: string): () => void {
  const isWhite = id === 'white' || id === 'rain'
  const buf = makeNoiseBuffer(ctx, isWhite ? 'white' : 'brown')
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true

  let birdTimer: ReturnType<typeof setTimeout> | null = null

  if (id === 'rain') {
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 900
    lp.Q.value = 0.5
    src.connect(lp)
    lp.connect(gain)
  } else if (id === 'library') {
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 180
    src.connect(lp)
    lp.connect(gain)
  } else if (id === 'forest') {
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 550
    bp.Q.value = 1.1
    src.connect(bp)
    bp.connect(gain)

    const chirp = () => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 2400 + Math.random() * 1600
      g.gain.value = 0
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start()
      const t = ctx.currentTime
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.05 * gain.gain.value, t + 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.stop(t + 0.32)
      birdTimer = setTimeout(chirp, 3500 + Math.random() * 8000)
    }
    birdTimer = setTimeout(chirp, 1800)
  } else {
    src.connect(gain)
  }

  src.start()

  return () => {
    try { src.stop() } catch {}
    if (birdTimer) clearTimeout(birdTimer)
  }
}

export function AmbientPlayer() {
  const [open,    setOpen]    = useState(false)
  const [active,  setActive]  = useState<string | null>(null)
  const [volume,  setVolume]  = useState<number>(() => parseFloat(localStorage.getItem('amb-vol') ?? '0.35'))
  const [loading, setLoading] = useState(false)

  const ctxRef   = useRef<AudioContext | null>(null)
  const gainRef  = useRef<GainNode | null>(null)
  const stopRef  = useRef<(() => void) | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
      gainRef.current = ctxRef.current.createGain()
      gainRef.current.gain.value = volume
      gainRef.current.connect(ctxRef.current.destination)
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }

  const stopAll = (instant = false) => {
    stopRef.current?.()
    stopRef.current = null
    if (audioRef.current) {
      const a = audioRef.current
      audioRef.current = null
      if (instant) { a.pause() } else {
        let v = a.volume
        const fade = setInterval(() => {
          v = Math.max(0, v - 0.04)
          a.volume = v
          if (v <= 0) { a.pause(); clearInterval(fade) }
        }, 25)
      }
    }
    if (gainRef.current && ctxRef.current && !instant) {
      gainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.3)
    }
  }

  const play = (id: string) => {
    if (active === id) { stopAll(); setActive(null); return }
    stopAll(true)
    setActive(id)
    const track = TRACKS.find(t => t.id === id)!

    if (track.type === 'stream') {
      setLoading(true)
      const a = new Audio(track.url)
      a.loop = true
      a.volume = 0
      audioRef.current = a
      a.addEventListener('canplay', () => {
        setLoading(false)
        let v = 0
        const fade = setInterval(() => {
          v = Math.min(volume, v + 0.03)
          a.volume = v
          if (v >= volume) clearInterval(fade)
        }, 25)
      }, { once: true })
      a.addEventListener('error', () => { setLoading(false); setActive(null) }, { once: true })
      a.play().catch(() => { setLoading(false); setActive(null) })
    } else {
      const ctx = getCtx()
      gainRef.current!.gain.setValueAtTime(0, ctx.currentTime)
      gainRef.current!.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.9)
      stopRef.current = startGenerated(ctx, gainRef.current!, id)
    }
  }

  const changeVol = (v: number) => {
    setVolume(v)
    localStorage.setItem('amb-vol', String(v))
    if (gainRef.current) gainRef.current.gain.value = v
    if (audioRef.current) audioRef.current.volume = v
  }

  useEffect(() => () => { stopAll(true); ctxRef.current?.close() }, [])

  const activeTrack = TRACKS.find(t => t.id === active)

  return (
    <div style={{ marginTop: 14, borderTop: '1px solid var(--bdr-2)', paddingTop: 12 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7, width: '100%',
          background: 'none', border: 'none', padding: '2px 0',
          cursor: 'pointer', fontFamily: 'inherit',
          color: active ? '#2563EB' : '#9BA5B4',
        }}
      >
        <Music size={13} strokeWidth={2} />
        <span style={{ fontSize: 12, fontWeight: 600, flex: 1, textAlign: 'left' }}>
          Sons ambiente{activeTrack ? ` · ${activeTrack.name}` : ''}{loading ? ' …' : ''}
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
            {TRACKS.map(t => (
              <button
                key={t.id}
                onClick={() => play(t.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 4px', borderRadius: 'var(--r-xs)',
                  border: `1.5px solid ${active === t.id ? '#2563EB' : 'var(--bdr-2)'}`,
                  background: active === t.id ? '#EFF6FF' : '#fff',
                  color: active === t.id ? '#2563EB' : '#9BA5B4',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                }}
              >
                {t.icon}
                <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1.3, textAlign: 'center' }}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <VolumeX size={12} style={{ color: '#C2CAD8', flexShrink: 0 }} />
            <input
              type="range" min="0" max="1" step="0.02"
              value={volume}
              onChange={e => changeVol(+e.target.value)}
              style={{ flex: 1, height: 3, accentColor: '#2563EB', cursor: 'pointer' }}
            />
            <Volume2 size={12} style={{ color: '#6E5CF6', flexShrink: 0 }} />
          </div>
        </div>
      )}
    </div>
  )
}
