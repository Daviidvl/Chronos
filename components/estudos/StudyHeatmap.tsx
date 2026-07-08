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

const WEEKS  = 13
const CELL   = 13
const GAP    = 3
const STEP   = CELL + GAP

function getColor(mins: number, isToday: boolean): string {
  if (isToday && mins === 0) return 'transparent'
  if (mins === 0)  return 'var(--bdr-2, #E9ECF2)'
  if (mins < 30)   return '#DDD6FE'
  if (mins < 60)   return '#A78BFA'
  if (mins < 120)  return '#7C3AED'
  return '#6E5CF6'
}

function formatMins(m: number): string {
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r === 0 ? `${h}h` : `${h}h${String(r).padStart(2, '0')}`
}

export function StudyHeatmap({ data }: Props) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  const { grid, monthLabels, todayISO } = useMemo(() => {
    const byDate: Record<string, number> = {}
    data.forEach(d => { byDate[d.date] = (byDate[d.date] ?? 0) + d.minutes })

    const today    = new Date()
    const todayISO = format(today, 'yyyy-MM-dd')
    const endDate  = today
    const rawStart = addDays(endDate, -(WEEKS * 7 - 1))
    const startDate = startOfWeek(rawStart, { weekStartsOn: 1 })

    const days: { date: string; minutes: number; isPad: boolean }[] = []
    let cur = startDate
    while (cur <= endDate) {
      const iso = format(cur, 'yyyy-MM-dd')
      days.push({ date: iso, minutes: byDate[iso] ?? 0, isPad: false })
      cur = addDays(cur, 1)
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
      const d     = new Date(first.date + 'T12:00:00')
      const month = d.getMonth()
      if (month !== lastMonth) {
        monthLabels.push({ label: format(d, 'MMM', { locale: ptBR }), col: wi })
        lastMonth = month
      }
    })

    return { grid, monthLabels, todayISO }
  }, [data])

  const DAY_LABELS = ['Seg', '', 'Qua', '', 'Sex', '', '']
  const DAY_LABEL_W = 24

  const totalStudied = data.reduce((s, d) => s + d.minutes, 0)
  const activeDays   = data.filter(d => d.minutes > 0).length

  return (
    <div>
      {/* Title + summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#121826', marginBottom: 2 }}>
            Atividade de estudo
          </p>
          <p style={{ fontSize: 11, color: '#9BA5B4' }}>
            {activeDays} dias ativos · {formatMins(totalStudied)} no total
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'inline-block' }}>
          {/* Month row */}
          <div style={{
            display: 'flex', marginLeft: DAY_LABEL_W + GAP,
            marginBottom: 6, position: 'relative',
            height: 14,
          }}>
            {monthLabels.map(({ label, col }) => (
              <span
                key={`${label}-${col}`}
                style={{
                  position: 'absolute',
                  left: col * STEP,
                  fontSize: 10, fontWeight: 600,
                  color: '#9BA5B4',
                  textTransform: 'capitalize',
                  letterSpacing: '0.02em',
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid + day labels */}
          <div style={{ display: 'flex', gap: GAP }}>
            {/* Day labels */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: GAP,
              width: DAY_LABEL_W, flexShrink: 0,
            }}>
              {DAY_LABELS.map((d, i) => (
                <div
                  key={i}
                  style={{
                    height: CELL,
                    fontSize: 9, fontWeight: 600,
                    color: '#C2CAD8',
                    lineHeight: `${CELL}px`,
                    textAlign: 'right',
                    paddingRight: 4,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {grid.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                {week.map((day, di) => {
                  if (day.isPad || !day.date) {
                    return <div key={di} style={{ width: CELL, height: CELL }} />
                  }
                  const isToday = day.date === todayISO
                  const label   = day.minutes > 0
                    ? `${format(new Date(day.date + 'T12:00:00'), 'dd MMM', { locale: ptBR })} · ${formatMins(day.minutes)}`
                    : format(new Date(day.date + 'T12:00:00'), 'dd MMM', { locale: ptBR })

                  return (
                    <div
                      key={di}
                      onMouseEnter={e => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect()
                        setTooltip({ text: label, x: rect.left + CELL / 2, y: rect.top - 8 })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{
                        width: CELL, height: CELL,
                        borderRadius: 3,
                        background: getColor(day.minutes, isToday),
                        border: isToday ? '1.5px solid #6E5CF6' : 'none',
                        cursor: 'default',
                        transition: 'opacity 0.1s',
                        boxSizing: 'border-box',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            marginTop: 10, marginLeft: DAY_LABEL_W + GAP,
          }}>
            <span style={{ fontSize: 9, color: '#C2CAD8', fontWeight: 600, marginRight: 2 }}>Menos</span>
            {[0, 20, 50, 90, 130].map(m => (
              <div
                key={m}
                style={{
                  width: CELL, height: CELL, borderRadius: 3,
                  background: getColor(m, false),
                  border: m === 0 ? '1px solid var(--bdr-2, #E9ECF2)' : 'none',
                }}
              />
            ))}
            <span style={{ fontSize: 9, color: '#C2CAD8', fontWeight: 600, marginLeft: 2 }}>Mais</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x, top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: '#121826',
            color: '#fff',
            fontSize: 11, fontWeight: 600,
            padding: '4px 8px',
            borderRadius: 6,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  )
}
