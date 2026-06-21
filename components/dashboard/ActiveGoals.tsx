'use client'

import { motion } from 'framer-motion'
import { useGoalsStore } from '@/lib/store/useGoalsStore'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/types'
import { getCategoryLabel, getProgressColor, cn } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO, differenceInDays } from 'date-fns'

export function ActiveGoals() {
  const { getActiveGoals } = useGoalsStore()
  const goals = getActiveGoals().slice(0, 3)

  return (
    <div className="space-y-2">
      {goals.map((goal, i) => {
        const color = CATEGORY_COLORS[goal.category] ?? 'var(--accent)'
        const icon = CATEGORY_ICONS[goal.category] ?? '🎯'
        const daysLeft = goal.deadline
          ? differenceInDays(parseISO(goal.deadline), new Date())
          : null

        return (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link href="/goals">
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-150 cursor-pointer group"
                style={{ border: '1px solid var(--border)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: `${color}15` }}
                >
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">{goal.title}</span>
                    <span className="text-xs font-semibold ml-2 flex-shrink-0" style={{ color }}>{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} colorClass={color} height={3} />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px]" style={{ color: `${color}99` }}>{getCategoryLabel(goal.category)}</span>
                    {daysLeft !== null && (
                      <>
                        <span className="text-[var(--border-strong)]">·</span>
                        <span className={cn(
                          'text-[11px]',
                          daysLeft <= 7 ? 'text-[var(--danger)]' : 'text-[var(--text-tertiary)]'
                        )}>
                          {daysLeft <= 0 ? 'Vencido' : `${daysLeft}d restantes`}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <ChevronRight size={14} className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        )
      })}

      {goals.length === 0 && (
        <Link href="/goals">
          <div className="text-sm text-[var(--text-tertiary)] px-2 py-3 hover:text-[var(--text-secondary)] transition-colors">
            Nenhuma meta ativa. Criar primeira meta →
          </div>
        </Link>
      )}
    </div>
  )
}
