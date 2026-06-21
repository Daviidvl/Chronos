'use client'

import { motion } from 'framer-motion'
import { useUserStore } from '@/lib/store/useUserStore'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useGoalsStore } from '@/lib/store/useGoalsStore'
import { useJournalStore } from '@/lib/store/useJournalStore'
import { calculateLevel, formatXP } from '@/lib/utils'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import {
  User, Zap, Trophy, Download, RefreshCw, Bell, Palette,
  ChevronRight, Star, Lock,
} from 'lucide-react'

function UserSection() {
  const { user, updateUser } = useUserStore()
  const level = calculateLevel(user.xp)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
          style={{ background: 'linear-gradient(135deg, var(--accent), #8B5CF6)' }}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="text-base font-bold bg-transparent outline-none border-b border-[var(--accent)] pb-0.5"
                style={{ color: 'var(--text-primary)' }}
                autoFocus
                onBlur={() => {
                  updateUser({ name })
                  setEditing(false)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') { updateUser({ name }); setEditing(false) }
                  if (e.key === 'Escape') setEditing(false)
                }}
              />
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-base font-bold text-[var(--text-primary)] hover:opacity-80 transition-opacity text-left">
              {user.name}
            </button>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            <Zap size={12} style={{ color: '#F59E0B' }} />
            <span className="text-xs text-[var(--text-tertiary)]">Nível {level.level} · {level.title}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--text-tertiary)]">{user.xp} XP · Nível {level.level + 1} em {level.xpToNext} XP</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>{level.progress}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-active)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--accent), #8B5CF6)' }}
            initial={{ width: 0 }}
            animate={{ width: `${level.progress}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  )
}

function AchievementsSection() {
  const { achievements } = useUserStore()
  const unlocked = achievements.filter(a => a.unlocked)
  const locked = achievements.filter(a => !a.unlocked)

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={15} style={{ color: '#F59E0B' }} />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Conquistas</h2>
        </div>
        <Badge variant="warning">{unlocked.length}/{achievements.length}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {unlocked.map(a => (
          <div
            key={a.id}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            <div className="text-2xl">{a.icon}</div>
            <div className="text-xs font-semibold text-[var(--text-primary)]">{a.name}</div>
            <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">{a.description}</div>
            <Badge variant="warning">+{a.xpReward} XP</Badge>
          </div>
        ))}
        {locked.map(a => (
          <div
            key={a.id}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center opacity-40"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="text-2xl grayscale">{a.icon}</div>
            <div className="text-xs font-medium text-[var(--text-tertiary)]">{a.name}</div>
            <div className="text-[10px] text-[var(--text-tertiary)] leading-tight">{a.description}</div>
            <Lock size={10} style={{ color: 'var(--text-tertiary)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DataSection() {
  const { habits } = useHabitsStore()
  const { tasks } = useTasksStore()
  const { goals } = useGoalsStore()
  const { entries } = useJournalStore()

  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      habits,
      tasks,
      goals,
      journalEntries: entries,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chronos-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-5 rounded-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Download size={15} style={{ color: 'var(--accent)' }} />
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Dados</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Hábitos', value: habits.length },
          { label: 'Tarefas', value: tasks.length },
          { label: 'Metas', value: goals.length },
          { label: 'Diário', value: entries.length },
        ].map(s => (
          <div key={s.label} className="text-center px-3 py-3 rounded-xl" style={{ background: 'var(--surface)' }}>
            <div className="text-lg font-bold text-[var(--text-primary)]">{s.value}</div>
            <div className="text-[11px] text-[var(--text-tertiary)]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={exportData} className="flex-1">
          <Download size={13} /> Exportar JSON
        </Button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Configurações</h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Perfil, conquistas e dados</p>
      </motion.div>

      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <UserSection />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AchievementsSection />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <DataSection />
        </motion.div>

        {/* App info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-center py-4 text-xs text-[var(--text-tertiary)]">
          Chronos v1.0.0 · Construído com Next.js 15 + Tailwind + Framer Motion
        </motion.div>
      </div>
    </div>
  )
}
