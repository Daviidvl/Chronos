import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Habit, HabitLog } from '@/types'

interface Props {
  habits: Habit[]
  logs: HabitLog[]
  onToggle: (habit: Habit, done: boolean) => void
}

export function HabitsToday({ habits, logs, onToggle }: Props) {
  if (habits.length === 0) return null

  const doneCount = habits.filter(h =>
    logs.some(l => l.habit_id === h.id && l.completed)
  ).length

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Hábitos de hoje</h2>
        <span
          className="badge-pill"
          style={{ background: '#EDE9FE', color: '#6E5CF6' }}
        >
          {doneCount}/{habits.length}
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {habits.map((habit, i) => {
          const done = logs.some(l => l.habit_id === habit.id && l.completed)

          return (
            <motion.div
              key={habit.id}
              layout
              style={{
                borderBottom: i < habits.length - 1 ? '1px solid var(--bdr)' : 'none',
              }}
            >
              <div className="habit-row-today">
                {/* Color bar */}
                <div
                  style={{
                    width: 3,
                    height: 38,
                    borderRadius: 99,
                    background: habit.color,
                    flexShrink: 0,
                    opacity: done ? 0.30 : 1,
                    transition: 'opacity 0.25s',
                  }}
                />

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className={`habit-name-today${done ? ' habit-name-today--done' : ''}`}>
                    {habit.name}
                  </p>
                </div>

                {/* Check button */}
                <button
                  onClick={() => onToggle(habit, !done)}
                  className={`habit-check-btn${done ? ' habit-check-btn--done' : ''}`}
                  style={{ '--habit-color': habit.color } as React.CSSProperties}
                >
                  <AnimatePresence>
                    {done && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 550, damping: 28 }}
                      >
                        <Check size={11} strokeWidth={3.5} color="#fff" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
