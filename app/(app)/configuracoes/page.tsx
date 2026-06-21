'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useUserStore } from '@/lib/store/useUserStore'
import { useHabitsStore } from '@/lib/store/useHabitsStore'
import { useTasksStore } from '@/lib/store/useTasksStore'
import { useGoalsStore } from '@/lib/store/useGoalsStore'
import { Download } from 'lucide-react'

export default function ConfigPage() {
  const { user, updateUser } = useUserStore()
  const { habits } = useHabitsStore()
  const { tasks } = useTasksStore()
  const { goals } = useGoalsStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)

  const handleSave = () => {
    if (name.trim()) updateUser({ name: name.trim() })
    setEditing(false)
  }

  const exportData = () => {
    const data = { exportedAt: new Date().toISOString(), habits, tasks, goals }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chronos-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-6">
      <motion.header initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-[32px] font-semibold text-[var(--text-1)] tracking-tight leading-none">Configurações</h1>
      </motion.header>

      <div className="space-y-4">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="rounded-[20px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-[11px] font-medium text-[var(--text-3)] uppercase tracking-widest mb-4">Perfil</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[17px] font-semibold text-white flex-shrink-0"
              style={{ background: 'var(--accent)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-3">
                  <input value={name} onChange={e => setName(e.target.value)} autoFocus
                    className="flex-1 text-[15px] font-medium bg-transparent outline-none text-[var(--text-1)]"
                    style={{ borderBottom: '1px solid var(--accent)', paddingBottom: 2 }}
                    onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }} />
                  <button onClick={handleSave} className="text-[13px] font-medium text-[var(--accent)]">Salvar</button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="text-[15px] font-medium text-[var(--text-1)] text-left hover:text-[var(--text-2)] transition-colors">
                  {user.name}
                </button>
              )}
              {!editing && <p className="text-[12px] text-[var(--text-4)] mt-0.5">Toque para editar</p>}
            </div>
          </div>
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-[20px] p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-[11px] font-medium text-[var(--text-3)] uppercase tracking-widest mb-4">Dados</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Hábitos', value: habits.length },
              { label: 'Tarefas', value: tasks.length },
              { label: 'Metas', value: goals.length },
            ].map(s => (
              <div key={s.label} className="rounded-[14px] p-3 text-center" style={{ background: 'var(--surface-hover)' }}>
                <div className="text-[22px] font-semibold text-[var(--text-1)]">{s.value}</div>
                <div className="text-[11px] text-[var(--text-3)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <button onClick={exportData}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] text-[14px] text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
            style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
            <Download size={15} /> Exportar dados (JSON)
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.16 }} className="text-center pt-4">
          <p className="text-[11px] text-[var(--text-4)]">Chronos · v2.0</p>
        </motion.div>
      </div>
    </div>
  )
}
