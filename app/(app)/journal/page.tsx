'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useJournalStore } from '@/lib/store/useJournalStore'
import { JournalMood } from '@/types'
import { getMoodEmoji, getMoodLabel, todayISO, formatDate, getLast365Days, getHeatmapColor, cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit3, Eye, CalendarDays, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const MOODS: JournalMood[] = ['great', 'good', 'okay', 'bad', 'terrible']

function MoodPicker({ value, onChange }: { value?: JournalMood; onChange: (m: JournalMood) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-tertiary)]">Como você está?</span>
      <div className="flex gap-1.5">
        {MOODS.map(m => (
          <button
            key={m}
            onClick={() => onChange(m)}
            title={getMoodLabel(m)}
            className={cn(
              'w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all',
              value === m ? 'bg-[var(--surface-active)] scale-110' : 'hover:bg-[var(--surface-hover)] opacity-50 hover:opacity-100'
            )}
          >
            {getMoodEmoji(m)}
          </button>
        ))}
      </div>
    </div>
  )
}

function CalendarStrip() {
  const { entries, getEntryForDate } = useJournalStore()
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const days = getLast365Days().slice(-30)

  const entryDates = new Set(entries.map(e => e.date))

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2">
      {days.map(day => {
        const hasEntry = entryDates.has(day)
        const isSelected = day === selectedDate
        const isToday = day === todayISO()

        return (
          <button
            key={day}
            onClick={() => setSelectedDate(day)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl flex-shrink-0 min-w-[36px] transition-all',
              isSelected ? 'bg-[var(--accent)]' :
              isToday ? 'bg-[var(--surface-hover)]' :
              'hover:bg-[var(--surface-hover)]'
            )}
          >
            <span className={cn('text-[10px]', isSelected ? 'text-white' : 'text-[var(--text-tertiary)]')}>
              {format(parseISO(day), 'EEE', { locale: ptBR }).slice(0, 1)}
            </span>
            <span className={cn('text-xs font-medium', isSelected ? 'text-white' : 'text-[var(--text-secondary)]')}>
              {format(parseISO(day), 'd')}
            </span>
            {hasEntry && !isSelected && (
              <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
            )}
            {isSelected && hasEntry && (
              <div className="w-1 h-1 rounded-full bg-white" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function JournalPage() {
  const { getOrCreateToday, updateEntry, entries } = useJournalStore()
  const [entry, setEntry] = useState(() => getOrCreateToday())
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [saved, setSaved] = useState(false)

  const handleChange = (content: string) => {
    setEntry(e => ({ ...e, content }))
    updateEntry(entry.id, { content })
    setSaved(false)
    setTimeout(() => setSaved(true), 300)
  }

  const handleMood = (mood: JournalMood) => {
    setEntry(e => ({ ...e, mood }))
    updateEntry(entry.id, { mood })
  }

  const totalEntries = entries.length
  const moodCounts = entries.reduce((acc, e) => {
    if (e.mood) acc[e.mood] = (acc[e.mood] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Diário</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
            {totalEntries} entradas · {topMood ? `${getMoodEmoji(topMood[0])} frequente` : 'comece a escrever'}
          </p>
        </div>
      </motion.div>

      {/* Calendar strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="mb-5">
        <CalendarStrip />
      </motion.div>

      {/* Editor */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        {/* Editor header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--text-primary)] capitalize">
              {format(parseISO(entry.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </span>
            {saved && <span className="text-[11px] text-[var(--success)]">Salvo ✓</span>}
          </div>
          <div className="flex items-center gap-2">
            <MoodPicker value={entry.mood} onChange={handleMood} />
            <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: 'var(--surface)' }}>
              <button
                onClick={() => setMode('edit')}
                className={cn('p-1.5 rounded-md transition-all', mode === 'edit' ? 'bg-[var(--surface-active)]' : 'hover:bg-[var(--surface-hover)]')}
              >
                <Edit3 size={13} style={{ color: mode === 'edit' ? 'var(--text-primary)' : 'var(--text-tertiary)' }} />
              </button>
              <button
                onClick={() => setMode('preview')}
                className={cn('p-1.5 rounded-md transition-all', mode === 'preview' ? 'bg-[var(--surface-active)]' : 'hover:bg-[var(--surface-hover)]')}
              >
                <Eye size={13} style={{ color: mode === 'preview' ? 'var(--text-primary)' : 'var(--text-tertiary)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Writing prompts */}
        {!entry.content && mode === 'edit' && (
          <div className="px-4 pt-3 flex flex-wrap gap-1.5">
            {[
              'Como foi meu dia?',
              'O que aprendi hoje?',
              'Pelo que sou grato?',
              'O que posso melhorar?',
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => handleChange(`## ${prompt}\n\n`)}
                className="px-2.5 py-1 rounded-lg text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors border border-[var(--border)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Content area */}
        <div className="p-4 min-h-[300px]">
          {mode === 'edit' ? (
            <textarea
              value={entry.content}
              onChange={e => handleChange(e.target.value)}
              placeholder="Escreva seus pensamentos, reflexões, gratidão... Suporte a Markdown."
              className="w-full min-h-[280px] text-sm leading-relaxed resize-none outline-none"
              style={{
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontFamily: 'inherit',
                lineHeight: '1.8',
              }}
            />
          ) : (
            <div className="prose-dark">
              {entry.content ? (
                <ReactMarkdown>{entry.content}</ReactMarkdown>
              ) : (
                <p style={{ color: 'var(--text-tertiary)' }}>Nenhum conteúdo para visualizar.</p>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent entries */}
      {entries.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-6"
        >
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <CalendarDays size={14} /> Entradas recentes
          </h2>
          <div className="space-y-2">
            {entries
              .filter(e => e.id !== entry.id)
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map(e => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
                  style={{ border: '1px solid var(--border)' }}
                  onClick={() => setEntry(e)}
                >
                  <span className="text-base flex-shrink-0">{e.mood ? getMoodEmoji(e.mood) : '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--text-tertiary)] mb-0.5 capitalize">
                      {format(parseISO(e.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] line-clamp-2">
                      {e.content.replace(/[#*_`>]/g, '').slice(0, 120) || 'Entrada vazia'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
