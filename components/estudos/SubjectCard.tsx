'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Plus, Trash2, ChevronDown, ChevronUp, CalendarMinus } from 'lucide-react'
import type { Subject, Topic } from '@/types'
import { formatMinutes } from '@/lib/utils'

interface Props {
  subject: Subject
  topics: Topic[]
  sessionMinutes: number
  onToggleTopic: (topic: Topic, done: boolean) => void
  onAddTopic: (subjectId: string, title: string, estimatedMinutes: number) => Promise<void>
  onDelete: (id: string) => void
  onRemoveFromDay?: () => void
}

export function SubjectCard({
  subject, topics, sessionMinutes,
  onToggleTopic, onAddTopic, onDelete, onRemoveFromDay,
}: Props) {
  const [expanded, setExpanded]     = useState(true)
  const [addingTopic, setAddingTopic] = useState(false)
  const [topicTitle, setTopicTitle]  = useState('')
  const [topicMins, setTopicMins]   = useState('30')
  const [saving, setSaving]         = useState(false)

  const completed = topics.filter(t => t.completed).length
  const pct       = topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topicTitle.trim()) return
    setSaving(true)
    await onAddTopic(subject.id, topicTitle.trim(), parseInt(topicMins) || 30)
    setTopicTitle('')
    setTopicMins('30')
    setAddingTopic(false)
    setSaving(false)
  }

  return (
    <div className="subject-card">
      {/* Header */}
      <div className="subject-header">
        {/* Color accent bar */}
        <div
          style={{
            width: 4,
            height: 40,
            borderRadius: 99,
            background: subject.color,
            flexShrink: 0,
          }}
        />

        <span className="subject-icon">{subject.icon}</span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="subject-name">{subject.name}</p>
          <p style={{ fontSize: 12, color: '#9BA5B4', marginTop: 1 }}>
            {topics.length === 0
              ? 'Sem conteúdos'
              : `${completed}/${topics.length} · ${formatMinutes(sessionMinutes)} estudados`}
          </p>
        </div>

        {/* Progress badge */}
        {topics.length > 0 && (
          <span
            className="badge-pill"
            style={{
              background: pct === 100 ? '#D3F9EE' : '#EDE9FE',
              color:      pct === 100 ? '#2CC08C' : '#6E5CF6',
            }}
          >
            {pct}%
          </span>
        )}

        <button
          onClick={() => setExpanded(e => !e)}
          className="btn-icon"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {onRemoveFromDay && (
          <button
            onClick={onRemoveFromDay}
            className="btn-icon"
            title="Remover deste dia"
            style={{ color: '#9BA5B4' }}
          >
            <CalendarMinus size={14} />
          </button>
        )}

        <button
          onClick={() => onDelete(subject.id)}
          className="btn-icon danger"
          title="Eliminar matéria"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Topics */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {/* Progress bar */}
            {topics.length > 0 && (
              <div style={{ padding: '0 18px 14px' }}>
                <div className="progress-track">
                  <motion.div
                    className={`progress-fill${pct === 100 ? ' progress-fill--success' : ''}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {topics.map(topic => (
                <motion.div
                  key={topic.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="topic-row"
                >
                  <button
                    onClick={() => onToggleTopic(topic, !topic.completed)}
                    className={`check${topic.completed ? ' check--done' : ''}`}
                    style={{ width: 20, height: 20, flexShrink: 0 }}
                  >
                    <AnimatePresence>
                      {topic.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 550, damping: 28 }}
                        >
                          <Check size={10} strokeWidth={3.5} color="#fff" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  <span className={`topic-title${topic.completed ? ' topic-title--done' : ''}`}>
                    {topic.title}
                  </span>

                  <span className="topic-time">
                    {formatMinutes(topic.estimated_minutes)}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add topic form */}
            <AnimatePresence>
              {addingTopic && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddTopic}
                  style={{ padding: '12px 18px', borderTop: '1px solid var(--bdr)' }}
                >
                  <input
                    autoFocus
                    value={topicTitle}
                    onChange={e => setTopicTitle(e.target.value)}
                    placeholder="Nome do conteúdo"
                    className="field"
                    style={{ marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Tempo estimado (min)</label>
                      <input
                        type="number"
                        min="5"
                        max="480"
                        value={topicMins}
                        onChange={e => setTopicMins(e.target.value)}
                        className="field field-sm"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                      <button
                        type="button"
                        onClick={() => setAddingTopic(false)}
                        className="btn btn-ghost"
                        style={{ minHeight: 40, padding: '0 16px', fontSize: 13 }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!topicTitle.trim() || saving}
                        className="btn btn-brand"
                        style={{ minHeight: 40, padding: '0 16px', fontSize: 13 }}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Add topic button */}
            {!addingTopic && (
              <div style={{ padding: '10px 18px', borderTop: topics.length > 0 ? '1px solid var(--bdr)' : 'none' }}>
                <button
                  onClick={() => setAddingTopic(true)}
                  className="btn-text"
                  style={{ gap: 6, padding: '6px 0' }}
                >
                  <Plus size={13} strokeWidth={2.5} />
                  Adicionar conteúdo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
