import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, Trash2 } from 'lucide-react'
import type { Task, Priority } from '@/types'
import { timeRange } from '@/lib/utils'

const PRIORITY: Record<Priority, { dot: string; label: string }> = {
  high:   { dot: '#F04438', label: 'Alta' },
  medium: { dot: '#F79009', label: 'Média' },
  low:    { dot: '#2CC08C', label: 'Baixa' },
}

interface Props {
  tasks: Task[]
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}

export function TasksToday({ tasks, onToggle, onDelete }: Props) {
  const pending = tasks.filter(t => !t.completed)
  if (pending.length === 0) return null

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Próximas tarefas</h2>
        <span className="badge-pill" style={{ background: '#EDE9FE', color: '#6E5CF6' }}>
          {pending.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence mode="popLayout">
          {pending.map(task => {
            const priority = (task.priority ?? 'medium') as Priority
            const cfg = PRIORITY[priority]

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14 } }}
                className="card"
              >
                <div className="task-row">
                  {/* Priority dot */}
                  <div
                    className="priority-dot"
                    style={{ background: cfg.dot }}
                  />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="task-title">{task.title}</p>

                    <div className="task-meta">
                      {task.start_time && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={11} />
                          {timeRange(task.start_time, task.end_time)}
                        </span>
                      )}
                      {task.category && (
                        <span
                          className="badge"
                          style={{
                            background: task.category.color + '18',
                            color: task.category.color,
                          }}
                        >
                          {task.category.name}
                        </span>
                      )}
                      <span style={{ color: cfg.dot, fontSize: 11, fontWeight: 600 }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Complete button */}
                  <button
                    onClick={() => onToggle(task.id, true)}
                    className="check"
                    title="Marcar como concluída"
                  >
                    <Check size={10} strokeWidth={3} style={{ opacity: 0.25 }} />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(task.id)}
                    className="btn-icon danger"
                    title="Apagar tarefa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
