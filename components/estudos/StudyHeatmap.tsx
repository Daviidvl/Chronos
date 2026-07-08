import { useMemo, useState } from 'react'
import { format, addDays, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DayData {
  date: string
  minutes: number
}

interface Props {
  data: DayData[]
}

const WEEKS = 12
const CELL  = 14
const GAP   = 4
const STEP  = CELL + GAP

const LEVEL_COLORS = [
  '#EDEEF2',  // 0  — empty
  '#C4B5FD',  // 1  — < 30 min
  '#A78BFA',  // 2  — < 60 min
  '#7C3AED',  // 3  — < 120 min
  '#6E5CF6',  // 4  — 120 min+
]

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

export function StudyHeatmap({ data }: Props) {
  const [hovered, setHovered] = useState<{ text: string; x: number; y: number } | null>(null)

  const { grid, monthLabels, todayStr } = useMemo(() => {
    const byDate: Record<string, number> = {}
    data.forEach(d => { byDate[d.date] = (byDate[d.date] ?? 0) + d.minutes })

    const today    = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    const rawStart = addDays(today, -(WEEKS * 7 - 1))
    const start    = startOfWeek(rawStart, { weekStartsOn: 1 })

    const days: { date: string; minutes: number; isPad: boolean }[] = []
    let cur = start
    while (format(cur, 'yyyy-MM-dd') <= todayStr) {
      const iso = format(cur, 'yyyy-MM-dd')
      days.push({ date: iso, minutes: byDate[iso] ?? 0, isPad: false })
      cur = addDays(cur, 1)
    }
    while (days.length % 7 !== 0) {
      days.push({ date: '', minutes: 0, isPad: true })
    }
    while (days.length < WEEKS * 7) {
      days.push({ date: '', minutes: 0, isPad: true })
    }

    const grid: typeof days[] = []
    for (let w = 0; w < WEEKS; w++) {
      grid.push(days.slice(w * 7, w * 7 + 7))
    }

    const monthLabels: { label: string; col: number }[] = []
    let lastMonth = -1
    grid.forEach((week, wi) => {
      const first = week.find(d => !d.isPad && d.date)
      if (!first) return
      const d = new Date(first.date + 'T12:00:00')
      const m = d.getMonth()
      if (m !== lastMonth) {
        monthLabels.push({ label: format(d, 'MMM', { locale: ptBR }), col: wi })
        lastMonth = m
      }
    })

    return { grid, monthLabels, todayStr }
  }, [data])

  const totalMins  = data.reduce((s, d) => s + d.minutes, 0)
  const activeDays = data.filter(d => d.minutes > 0).length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#121826', letterSpacing: '-0.2px' }}>
          Atividade de estudo
        </p>
        <p style={{ fontSize: 11, color: '#9BA5B4', marginTop: 3 }}>
          {activeDays} {activeDays === 1 ? 'dia ativo' : 'dias ativos'} · {formatMins(totalMins)} no total
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
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
                          style={{ width: CELL, height: CELL, borderRadius: 3 }}
                        />
                      )
                    }

                    const isToday = day.date === todayStr
                    const level   = getLevel(day.minutes)
                    const d       = new Date(day.date + 'T12:00:00')
                    const label   = `${format(d, "dd 'de' MMM", { locale: ptBR })} · ${formatMins(day.minutes)}`

                    return (
                      <div
                        key={di}
                        onMouseEnter={e => {
                          const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                          setHovered({ text: label, x: r.left + CELL / 2, y: r.top - 6 })
                        }}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          width: CELL, height: CELL,
                          borderRadius: 3,
                          background: LEVEL_COLORS[level],
                          outline: isToday ? '2px solid #6E5CF6' : 'none',
                          outlineOffset: isToday ? '1px' : undefined,
                          cursor: 'default',
                          transition: 'transform 0.1s',
                          boxSizing: 'border-box',
                        }}
                        onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.3)' }}
                        onFocus={() => {}}
                        onBlur={() => {}}
                        // reset scale on mouse out
                        {...{ onMouseOut: (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' } }}
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
                  width: CELL, height: CELL, borderRadius: 3,
                  background: color,
                  border: i === 0 ? '1.5px solid #DDE1EA' : 'none',
                }}
              />
            ))}
            <span style={{ fontSize: 9, color: '#C2CAD8', fontWeight: 600, marginLeft: 1 }}>Mais</span>
          </div>
        </div>
      </div>

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
