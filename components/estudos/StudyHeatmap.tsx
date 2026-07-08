import { useMemo } from 'react'
import { format, addDays, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DayData {
  date: string
  minutes: number
}

interface Props {
  data: DayData[]
}

const WEEKS   = 13
const DAY_PX  = 11
const GAP_PX  = 2
const STEP    = DAY_PX + GAP_PX

function getColor(mins: number): string {
  if (mins === 0) return '#E9ECF2'
  if (mins < 30)  return '#DDD6FE'
  if (mins < 60)  return '#A78BFA'
  if (mins < 120) return '#7C3AED'
  return '#6E5CF6'
}

function formatMins(m: number): string {
  if (m < 60) return `${m}min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r === 0 ? `${h}h` : `${h}h${String(r).padStart(2, '0')}min`
}

export function StudyHeatmap({ data }: Props) {
  const { grid, monthLabels } = useMemo(() => {
    const byDate: Record<string, number> = {}
    data.forEach(d => { byDate[d.date] = (byDate[d.date] ?? 0) + d.minutes })

    const today   = new Date()
    const endDate = today
    // go back WEEKS * 7 days and align to Monday
    const rawStart = addDays(endDate, -(WEEKS * 7 - 1))
    const startDate = startOfWeek(rawStart, { weekStartsOn: 1 }) // Monday

    // build flat list of days from startDate to endDate
    const days: { date: string; minutes: number; isoPad: boolean }[] = []
    let cur = startDate
    while (cur <= endDate) {
      const iso = format(cur, 'yyyy-MM-dd')
      days.push({ date: iso, minutes: byDate[iso] ?? 0, isoPad: false })
      cur = addDays(cur, 1)
    }

    // pad end so grid is full WEEKS * 7 cells
    while (days.length < WEEKS * 7) {
      days.push({ date: '', minutes: 0, isoPad: true })
    }

    // chunk into weeks (columns of 7)
    const grid: typeof days[] = []
    for (let w = 0; w < WEEKS; w++) {
      grid.push(days.slice(w * 7, w * 7 + 7))
    }

    // month labels: find first day of each month within our range
    const monthLabels: { label: string; col: number }[] = []
    let lastMonth = -1
    grid.forEach((week, wi) => {
      const firstReal = week.find(d => !d.isoPad && d.date)
      if (!firstReal) return
      const d     = new Date(firstReal.date)
      const month = d.getMonth()
      if (month !== lastMonth) {
        monthLabels.push({ label: format(d, 'MMM', { locale: ptBR }), col: wi })
        lastMonth = month
      }
    })

    return { grid, monthLabels }
  }, [data])

  const DAYS_LABEL = ['Seg', '', 'Qua', '', 'Sex', '', '']

  const totalWidth  = WEEKS * STEP - GAP_PX
  const totalHeight = 7 * STEP - GAP_PX

  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#121826', marginBottom: 10 }}>
        Atividade de estudo
      </p>

      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'inline-block', minWidth: totalWidth + 30 }}>
          {/* Month labels */}
          <div style={{ display: 'flex', marginLeft: 28, marginBottom: 4, position: 'relative', height: 14 }}>
            {monthLabels.map(({ label, col }) => (
              <span
                key={`${label}-${col}`}
                style={{
                  position: 'absolute',
                  left: col * STEP,
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#9BA5B4',
                  textTransform: 'capitalize',
                }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'flex', gap: GAP_PX }}>
            {/* Day labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GAP_PX, marginRight: 4 }}>
              {DAYS_LABEL.map((d, i) => (
                <div
                  key={i}
                  style={{ height: DAY_PX, fontSize: 9, color: '#C2CAD8', lineHeight: `${DAY_PX}px`, fontWeight: 600 }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {grid.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP_PX }}>
                {week.map((day, di) => {
                  if (day.isoPad || !day.date) {
                    return <div key={di} style={{ width: DAY_PX, height: DAY_PX }} />
                  }
                  const label = day.minutes > 0
                    ? `${format(new Date(day.date), 'dd/MM/yyyy')} · ${formatMins(day.minutes)}`
                    : format(new Date(day.date), 'dd/MM/yyyy')
                  return (
                    <div
                      key={di}
                      title={label}
                      style={{
                        width:  DAY_PX,
                        height: DAY_PX,
                        borderRadius: 2,
                        background: getColor(day.minutes),
                        cursor: day.minutes > 0 ? 'pointer' : 'default',
                        transition: 'opacity 0.1s',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, marginLeft: 28 }}>
            <span style={{ fontSize: 9, color: '#C2CAD8', fontWeight: 600 }}>Menos</span>
            {[0, 20, 50, 90, 130].map(m => (
              <div key={m} style={{ width: DAY_PX, height: DAY_PX, borderRadius: 2, background: getColor(m) }} />
            ))}
            <span style={{ fontSize: 9, color: '#C2CAD8', fontWeight: 600 }}>Mais</span>
          </div>
        </div>
      </div>
    </div>
  )
}
