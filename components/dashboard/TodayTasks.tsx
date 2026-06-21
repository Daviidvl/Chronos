'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useUserStore } from '@/lib/store/useUserStore'
import { XP_REWARDS, CATEGORY_COLORS } from '@/types'
import { getPriorityColor, todayISO, cn } from '@/lib/utils'
import { Check, Plus } from 'lucide-react'
import Link from 'next/link'

export function TodayTasks() {
  const { tasks, toggleTask, getTodayTasks } = useTasksStore()
  const { addXP } = useUserStore()

  const todayTasks = getTodayTasks()
  const completedToday = tasks.filter(t => t.dueDate === todayISO() && t.completed)

  const handleToggle = (id: string, alreadyDone: boolean) => {
    if (!alreadyDone) addXP(XP_REWARDS.completeTask)
    toggleTask(id)
  }

  return (
    <div className="space-y-1">
      {todayTasks.map((task, i) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-[var(--surface-hover)] group transition-all cursor-pointer"
          onClick={() => handleToggle(task.id, task.completed)}
        >
          <div
            className="w-4.5 h-4.5 mt-0.5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-150 border"
            style={{
              width: 18, height: 18,
              background: task.completed ? getPriorityColor(task.priority) : 'transparent',
              borderColor: task.completed ? getPriorityColor(task.priority) : 'var(--border-strong)',
            }}
          >
            <AnimatePresence>
              {task.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  <Check size={10} strokeWidth={3} color="white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 min-w-0">
            <div className={cn(
              'text-sm',
              task.completed ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'
            )}>
              {task.title}
            </div>
          </div>

          <div
            className="w-1.5 h-1.5 mt-2 rounded-full flex-shrink-0"
            style={{ background: getPriorityColor(task.priority) }}
          />
        </motion.div>
      ))}

      {completedToday.length > 0 && (
        <div className="pt-2">
          <div className="text-[11px] text-[var(--text-tertiary)] px-2 mb-1">
            Concluídas ({completedToday.length})
          </div>
          {completedToday.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-2 py-1.5 cursor-pointer"
              onClick={() => handleToggle(task.id, task.completed)}
            >
              <div
                className="w-4.5 h-4.5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ width: 18, height: 18, background: 'var(--surface-active)', border: '1.5px solid var(--border)' }}
              >
                <Check size={10} strokeWidth={3} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <span className="text-sm text-[var(--text-tertiary)] line-through">{task.title}</span>
            </div>
          ))}
        </div>
      )}

      {todayTasks.length === 0 && completedToday.length === 0 && (
        <Link href="/tasks">
          <div className="flex items-center gap-2 px-2 py-3 text-[var(--text-tertiary)] text-sm hover:text-[var(--text-secondary)] transition-colors cursor-pointer">
            <Plus size={14} />
            Adicionar tarefa para hoje
          </div>
        </Link>
      )}
    </div>
  )
}
