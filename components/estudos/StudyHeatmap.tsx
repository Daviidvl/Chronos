import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { format, addDays, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DayData {
  date: string
  minutes: number
}

interface Props {
  data: DayData[]
  completedDays?: string[]
}

const WEEKS = 12
const CELL  = 14
const GAP   = 5

// Single hue (brand violet, H≈247°), monotonically decreasing lightness —
// so "more minutes" always reads as "darker", with no reversal step.
const LEVEL_COLORS = [
  '#F1F1F6',  // 0  — empty, recedes toward the card surface
  '#CDC6FA',  // 1  — < 30 min
  '#9B90F4',  // 2  — < 60 min
  '#6351EC',  // 3  — < 120 min
  '#311BDA',  // 4  — 120 min+
]

const COMPLETE_COLOR = '#2CC08C' // full day of study finished (status color, distinct hue)

function getLevel(mins: number): number {
  if (mins === 0)   return 0
  if (mins < 30)    return 1
  if (mins < 60)    return 2
  if (mins < 120)   return 3
  return 4
}

function formatMins(m: number): string {
  if (m === 0)  return 'Sem estudo'
  if (m < 60)   return `${m}min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r === 0 ? `${h}h` : `${h}h${String(r).padStart(2, '0')}`
}

const DAY_LABELS = ['Seg', '', 'Qua', '', 'Sex', '', '']
const DAY_LABEL_W = 28

export function StudyHeatmap({ data, completedDays = [] }: Props) {
  const [hovered, setHovered] = useState<{ text: string; x: number; y: number; complete: boolean } | null>(null)
  const completedSet = useMemo(() => new Set(completedDays), [completedDays])

  const { grid, monthLabels, todayStr } = useMemo(() => {
    const byDate: Record<string, number> = {}
    data.forEach(d => { byDate[d.date] = (byDate[d.date] ?? 0) + d.minutes })

    const today         = new Date()
    const todayStr      = format(today, 'yyyy-MM-dd')
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 })
    // Always exactly WEEKS*7 days ending in today's week — a fixed-size
    // window, never a variable-length one sliced down to size, so "today"
    // can never fall past the cut and silently disappear from the grid.
    const start = addDays(thisWeekStart, -(WEEKS - 1) * 7)

    const days: { date: string; minutes: number; isPad: boolean }[] = []
    for (let i = 0; i < WEEKS * 7; i++) {
      const cur = addDays(start, i)
      const iso = format(cur, 'yyyy-MM-dd')
      const isFuture = iso > todayStr
      days.push({ date: isFuture ? '' : iso, minutes: isFuture ? 0 : (byDate[iso] ?? 0), isPad: isFuture })
    }

    const grid: typeof days[] = []
    for (let w = 0; w < WEEKS; w++) {
      grid.push(days.slice(w * 7, w * 7 + 7))
    }

    // Minimum 2-column gap between labels — otherwise the first (partial)
    // month and the one right after it collide into unreadable text.
    const MIN_LABEL_GAP = 2
    const monthLabels: { label: string; col: number }[] = []
    let lastMonth = -1
    let lastLabelCol = -Infinity
    grid.forEach((week, wi) => {
      const first = week.find(d => !d.isPad && d.date)
      if (!first) return
      const d = new Date(first.date + 'T12:00:00')
      const m = d.getMonth()
      if (m !== lastMonth) {
        lastMonth = m
        if (wi - lastLabelCol >= MIN_LABEL_GAP) {
          monthLabels.push({ label: format(d, 'MMM', { locale: ptBR }), col: wi })
          lastLabelCol = wi
        }
      }
    })

    return { grid, monthLabels, todayStr }
  }, [data])

  const totalMins    = data.reduce((s, d) => s + d.minutes, 0)
  const activeDays   = data.filter(d => d.minutes > 0).length
  const completeDays = data.filter(d => completedSet.has(d.date)).length

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(110,92,246,0.1)', color: '#6E5CF6',
        }}>
          <CalendarDays size={15} strokeWidth={2.2} />
        </span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#121826', letterSpacing: '-0.2px' }}>
            Atividade de estudo
          </p>
          <p style={{ fontSize: 11, color: '#9BA5B4', marginTop: 2 }}>
            {activeDays} {activeDays === 1 ? 'dia ativo' : 'dias ativos'} · {formatMins(totalMins)} no total
            {completeDays > 0 && (
              <>
                {' · '}
                <span style={{ color: '#2CC08C', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {completeDays} {completeDays === 1 ? 'dia completo' : 'dias completos'}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ overflowX: 'auto' }}
      >
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
          {/* Month labels */}
          <div style={{ display: 'flex', marginLeft: DAY_LABEL_W + GAP }}>
            {grid.map((_, wi) => {
              const label = monthLabels.find(m => m.col === wi)
              return (
                <div
                  key={wi}
                  style={{ width: CELL, marginRight: wi < WEEKS - 1 ? GAP : 0 }}
                >
                  {label && (
                    <span style={{
                      fontSize: 9, fontWeight: 700,
                      color: '#B0B8C8',
                      textTransform: 'capitalize',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}>
                      {label.label}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Grid rows */}
          <div style={{ display: 'flex', gap: 0 }}>
            {/* Day labels column */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: GAP, width: DAY_LABEL_W, marginRight: GAP, flexShrink: 0,
            }}>
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  style={{
                    height: CELL,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 6,
                    fontSize: 9, fontWeight: 700,
                    color: '#C2CAD8',
                    letterSpacing: '0.02em',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div style={{ display: 'flex', gap: GAP }}>
              {grid.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                  {week.map((day, di) => {
                    if (day.isPad || !day.date) {
                      return (
                        <div
                          key={di}
                          style={{ width: CELL, height: CELL, borderRadius: 4 }}
                        />
                      )
                    }

                    const isToday   = day.date === todayStr
                    const isComplete = completedSet.has(day.date)
                    const level     = getLevel(day.minutes)
                    const d         = new Date(day.date + 'T12:00:00')
                    const label     = `${format(d, "dd 'de' MMM", { locale: ptBR })} · ${formatMins(day.minutes)}`

                    return (
                      <motion.div
                        key={di}
                        onMouseEnter={e => {
                          const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                          setHovered({ text: label, x: r.left + CELL / 2, y: r.top - 6, complete: isComplete })
                        }}
                        onMouseLeave={() => setHovered(null)}
                        whileHover={{ scale: 1.35 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        style={{
                          width: CELL, height: CELL,
                          borderRadius: 4,
                          background: isComplete ? COMPLETE_COLOR : LEVEL_COLORS[level],
                          // Halo ring (not an outline) so "today" stays legible against
                          // every fill in the ramp, light or dark.
                          boxShadow: isToday ? '0 0 0 2px #fff, 0 0 0 3.5px #6E5CF6' : 'none',
                          cursor: 'default',
                          boxSizing: 'border-box',
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            marginTop: 4, marginLeft: DAY_LABEL_W + GAP,
          }}>
            <span style={{ fontSize: 9, color: '#C2CAD8', fontWeight: 600, marginRight: 1 }}>Menos</span>
            {LEVEL_COLORS.map((color, i) => (
              <div
                key={i}
                style={{
                  width: CELL, height: CELL, borderRadius: 4,
                  background: color,
                  border: i === 0 ? '1.5px solid #DDE1EA' : 'none',
                }}
              />
            ))}
            <span style={{ fontSize: 9, color: '#C2CAD8', fontWeight: 600, marginLeft: 1 }}>Mais</span>

            <span style={{ width: 1, height: 12, background: '#E4E7ED', margin: '0 3px' }} />

            <div style={{
              width: CELL, height: CELL, borderRadius: 4,
              background: COMPLETE_COLOR,
            }} />
            <span style={{ fontSize: 9, color: '#C2CAD8', fontWeight: 600 }}>Dia completo</span>
          </div>
        </div>
      </motion.div>

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: 'fixed',
            left: hovered.x, top: hovered.y,
            transform: 'translate(-50%, -100%)',
            background: '#1E2330',
            color: '#fff',
            fontSize: 11, fontWeight: 600,
            padding: '5px 9px',
            borderRadius: 7,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {hovered.text}
          {hovered.complete && <span style={{ color: COMPLETE_COLOR }}> · Dia completo ✓</span>}
          <div style={{
            position: 'absolute', bottom: -4, left: '50%',
            transform: 'translateX(-50%)',
            width: 8, height: 8,
            background: '#1E2330',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          }} />
        </div>
      )}
    </div>
  )
}
