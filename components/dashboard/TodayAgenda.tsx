'use client'

import { motion } from 'framer-motion'
import { useCalendarStore } from '@/lib/store/useCalendarStore'
import { todayISO, formatTime, cn } from '@/lib/utils'
import { CATEGORY_COLORS } from '@/types'
import { Clock } from 'lucide-react'

export function TodayAgenda() {
  const { getEventsForDate } = useCalendarStore()
  const events = getEventsForDate(todayISO())

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const isPast = (time: string) => time < currentTime
  const isNow = (start: string, end?: string) => start <= currentTime && (!end || currentTime <= end)

  return (
    <div className="relative">
      {/* Timeline line */}
      <div
        className="absolute left-[22px] top-2 bottom-2 w-px"
        style={{ background: 'var(--border)' }}
      />

      <div className="space-y-1">
        {events.map((event, i) => {
          const past = isPast(event.startTime)
          const active = isNow(event.startTime, event.endTime)
          const color = CATEGORY_COLORS[event.category] ?? 'var(--accent)'

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'flex items-start gap-3 pl-1 pr-2 py-1.5 rounded-lg transition-all duration-150',
                active ? 'bg-[var(--surface-hover)]' : 'hover:bg-[var(--surface-hover)]'
              )}
            >
              {/* Time dot */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                <div
                  className="w-3 h-3 rounded-full z-10 flex-shrink-0"
                  style={{
                    background: active ? color : past ? 'var(--text-tertiary)' : 'var(--surface-active)',
                    border: `2px solid ${active ? color : 'var(--border-strong)'}`,
                    boxShadow: active ? `0 0 8px ${color}60` : 'none',
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium" style={{ color: past && !active ? 'var(--text-tertiary)' : color }}>
                    {formatTime(event.startTime)}
                    {event.endTime && ` – ${formatTime(event.endTime)}`}
                  </span>
                  {active && (
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                      style={{ background: `${color}20`, color }}
                    >
                      <span className="w-1 h-1 rounded-full bg-current animate-pulse inline-block" />
                      Agora
                    </span>
                  )}
                </div>
                <div className={cn(
                  'text-sm font-medium mt-0.5',
                  past && !active ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'
                )}>
                  {event.title}
                </div>
              </div>
            </motion.div>
          )
        })}

        {events.length === 0 && (
          <div className="flex items-center gap-2 py-4 pl-8 text-[var(--text-tertiary)] text-sm">
            <Clock size={14} />
            Nenhum evento hoje
          </div>
        )}
      </div>
    </div>
  )
}
