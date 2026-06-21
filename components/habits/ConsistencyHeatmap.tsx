'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { getLast365Days, getHeatmapColor, formatDate } from '@/lib/utils'

interface ConsistencyHeatmapProps {
  habitId: string
  color?: string
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const WEEKDAYS = ['', 'Seg', '', 'Qua', '', 'Sex', '']

export function ConsistencyHeatmap({ habitId, color = 'var(--accent)' }: ConsistencyHeatmapProps) {
  const { logs } = useHabitsStore()
  const [tooltip, setTooltip] = useState<{ date: string; completed: boolean; x: number; y: number } | null>(null)

  const days = getLast365Days()
  const completedDates = new Set(
    logs.filter(l => l.habitId === habitId && l.completed).map(l => l.date)
  )

  // Group into weeks
  const weeks: string[][] = []
  let currentWeek: string[] = []

  // Pad start to Monday
  const firstDay = new Date(days[0])
  const startPad = (firstDay.getDay() + 6) % 7
  for (let i = 0; i < startPad; i++) currentWeek.push('')

  days.forEach(day => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push('')
    weeks.push(currentWeek)
  }

  const totalCompleted = completedDates.size
  const rate = days.length > 0 ? Math.round((totalCompleted / days.length) * 100) : 0

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
        <span><span className="text-[var(--text-primary)] font-semibold">{totalCompleted}</span> dias concluídos</span>
        <span><span className="text-[var(--text-primary)] font-semibold">{rate}%</span> taxa de conclusão</span>
        <span className="text-[11px]">último ano</span>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: weeks.length * 14 + 30 }}>
          {/* Month labels */}
          <div className="flex mb-1 pl-8">
            {weeks.map((week, wi) => {
              const firstDate = week.find(d => d)
              if (!firstDate) return <div key={wi} style={{ width: 13, marginRight: 1 }} />
              const d = new Date(firstDate)
              if (d.getDate() <= 7) {
                return (
                  <div key={wi} className="text-[10px] text-[var(--text-tertiary)] flex-shrink-0" style={{ width: 13, marginRight: 1 }}>
                    {MONTHS[d.getMonth()]}
                  </div>
                )
              }
              return <div key={wi} style={{ width: 13, marginRight: 1 }} />
            })}
          </div>

          <div className="flex gap-0">
            {/* Weekday labels */}
            <div className="flex flex-col gap-px mr-1">
              {WEEKDAYS.map((d, i) => (
                <div key={i} className="text-[10px] text-[var(--text-tertiary)] h-[13px] flex items-center" style={{ width: 24 }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="flex gap-px">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-px">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="w-[12px] h-[12px] rounded-sm" style={{ opacity: 0 }} />
                    const completed = completedDates.has(day)
                    return (
                      <motion.div
                        key={di}
                        className="w-[12px] h-[12px] rounded-sm cursor-pointer transition-transform hover:scale-125"
                        style={{
                          background: completed
                            ? color
                            : 'rgba(255,255,255,0.06)',
                          opacity: completed ? 0.85 : 1,
                        }}
                        whileHover={{ scale: 1.3 }}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect()
                          setTooltip({ date: day, completed, x: rect.left, y: rect.top })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-2 pl-8">
            <span className="text-[10px] text-[var(--text-tertiary)]">Menos</span>
            {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
              <div
                key={i}
                className="w-[12px] h-[12px] rounded-sm"
                style={{ background: v === 0 ? 'rgba(255,255,255,0.06)' : color, opacity: v === 0 ? 1 : 0.2 + v * 0.8 }}
              />
            ))}
            <span className="text-[10px] text-[var(--text-tertiary)]">Mais</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1.5 rounded-lg text-xs pointer-events-none"
          style={{
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-strong)',
            left: tooltip.x + 14,
            top: tooltip.y - 30,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <div className="font-medium text-[var(--text-primary)]">
            {formatDate(tooltip.date, "dd 'de' MMMM, yyyy")}
          </div>
          <div style={{ color: tooltip.completed ? color : 'var(--text-tertiary)' }}>
            {tooltip.completed ? '✓ Concluído' : '✗ Não realizado'}
          </div>
        </div>
      )}
    </div>
  )
}
