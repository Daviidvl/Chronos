import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { formatMinutes } from '@/lib/utils'
import type { Topic, Subject } from '@/types'

interface Props {
  subjects: Subject[]
  topics:   Topic[]
  subjectId: string | null
  activeDay: number
  onToggle: (topic: Topic, done: boolean) => void
}

export function GuidedSession({ subjects, topics, subjectId, activeDay, onToggle }: Props) {
  const [open, setOpen] = useState(false)

  const todayTopics = topics.filter(t =>
    t.day_of_week === activeDay &&
    (subjectId ? t.subject_id === subjectId : true)
  )

  if (todayTopics.length === 0) return null

  const completed = todayTopics.filter(t => t.completed).length
  const pct       = Math.round((completed / todayTopics.length) * 100)
  const allDone   = completed === todayTopics.length

  const groups: { subject: Subject | null; topics: Topic[] }[] = subjectId
    ? [{ subject: subjects.find(s => s.id === subjectId) ?? null, topics: todayTopics }]
    : subjects
        .map(s => ({ subject: s, topics: todayTopics.filter(t => t.subject_id === s.id) }))
        .filter(g => g.topics.length > 0)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 16 }}>
      {/* Header — always visible, acts as toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        {/* Mini progress ring substitute: progress bar inline */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#121826' }}>
              {allDone ? 'Sessão concluída!' : 'Conteúdos de hoje'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: allDone ? '#2CC08C' : '#9BA5B4' }}>
              {completed}/{todayTopics.length}
            </span>
          </div>
          <div style={{ height: 3, background: '#E9ECF2', borderRadius: 99 }}>
            <motion.div
              style={{
                height: '100%', borderRadius: 99,
                background: allDone ? '#2CC08C' : '#6E5CF6',
              }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <div style={{ color: '#C2CAD8', flexShrink: 0 }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid var(--bdr)' }}>
              {groups.map((group, gi) => (
                <div key={group.subject?.id ?? gi}>
                  {!subjectId && group.subject && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 16px 4px',
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: group.subject.color, flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#9BA5B4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {group.subject.name}
                      </span>
                    </div>
                  )}

                  <AnimatePresence mode="popLayout">
                    {group.topics.map(topic => (
                      <motion.div
                        key={topic.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 16px',
                          opacity: topic.completed ? 0.55 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        <button
                          onClick={() => onToggle(topic, !topic.completed)}
                          style={{
                            width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                            border: `2px solid ${topic.completed ? '#2CC08C' : '#C2CAD8'}`,
                            background: topic.completed ? '#2CC08C' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {topic.completed && <Check size={11} strokeWidth={3} color="#fff" />}
                        </button>

                        <span style={{
                          flex: 1, fontSize: 13, fontWeight: 500, color: '#121826',
                          textDecoration: topic.completed ? 'line-through' : 'none',
                        }}>
                          {topic.title}
                        </span>

                        <span style={{ fontSize: 11, color: '#C2CAD8', flexShrink: 0, fontWeight: 600 }}>
                          {formatMinutes(topic.estimated_minutes)}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
