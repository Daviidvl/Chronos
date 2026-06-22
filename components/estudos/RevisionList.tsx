'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import type { Topic } from '@/types'

interface Props {
  topics: Topic[]
  onReview: (topic: Topic) => void
}

function urgencyLabel(reviewDate: string | null): { text: string; color: string } {
  if (!reviewDate) return { text: 'Revisar', color: '#9BA5B4' }
  const diff = Math.ceil(
    (new Date(reviewDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
  )
  if (diff < 0)  return { text: `${Math.abs(diff)}d atrasado`, color: '#F04438' }
  if (diff === 0) return { text: 'Hoje',      color: '#F79009' }
  if (diff === 1) return { text: 'Amanhã',    color: '#F79009' }
  return { text: `em ${diff}d`, color: '#9BA5B4' }
}

export function RevisionList({ topics, onReview }: Props) {
  if (topics.length === 0) return null

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Revisões</h2>
        <span className="badge-pill" style={{ background: '#FEF3C7', color: '#F79009' }}>
          {topics.length}
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <AnimatePresence mode="popLayout">
          {topics.map(topic => {
            const { text, color } = urgencyLabel(topic.review_date)
            const subjectColor = topic.subject?.color ?? '#6E5CF6'

            return (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="review-row"
              >
                {/* Subject color dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: subjectColor,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#121826', lineHeight: 1.4 }}>
                    {topic.title}
                  </p>
                  {topic.subject && (
                    <p style={{ fontSize: 12, color: '#9BA5B4', marginTop: 2 }}>
                      {topic.subject.name}
                    </p>
                  )}
                </div>

                <span
                  className="review-badge"
                  style={{ background: color + '18', color }}
                >
                  {text}
                </span>

                <button
                  onClick={() => onReview(topic)}
                  className="btn-icon"
                  title="Marcar como revisado"
                  style={{ color: subjectColor }}
                >
                  <RefreshCw size={15} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
