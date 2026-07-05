import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Topic } from '@/types'

export type ReviewDifficulty = 'hard' | 'normal' | 'easy'

interface Props {
  topics: Topic[]
  onReview: (topic: Topic, difficulty: ReviewDifficulty) => void
  onDismiss: (topic: Topic) => void
}

function urgencyLabel(reviewDate: string | null): { text: string; color: string } {
  if (!reviewDate) return { text: 'Revisar', color: '#9BA5B4' }
  const diff = Math.ceil(
    (new Date(reviewDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000
  )
  if (diff < 0)  return { text: `${Math.abs(diff)}d atrasado`, color: '#F04438' }
  if (diff === 0) return { text: 'Hoje',   color: '#F79009' }
  if (diff === 1) return { text: 'Amanhã', color: '#F79009' }
  return { text: `em ${diff}d`, color: '#9BA5B4' }
}

const VISIBLE = 3

export function RevisionList({ topics, onReview, onDismiss }: Props) {
  const [expanded,   setExpanded]   = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)

  const visible = expanded ? topics : topics.slice(0, VISIBLE)
  const hidden  = topics.length - VISIBLE

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Revisões pendentes</h2>
        <span className="badge-pill" style={{ background: '#FEF3C7', color: '#D97706' }}>
          {topics.length}
        </span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <AnimatePresence mode="popLayout">
          {visible.map((topic, idx) => {
            const isConfirming = confirming === topic.id
            const { text, color } = urgencyLabel(topic.review_date)
            const subjectColor = topic.subject?.color ?? '#6E5CF6'
            const isLast = idx === visible.length - 1 && !(!expanded && hidden > 0)

            return (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isConfirming ? (
                    /* Difficulty picker */
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        padding: '14px 16px',
                        borderBottom: isLast ? 'none' : '1px solid var(--bdr)',
                        background: '#FAFBFC',
                      }}
                    >
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#9BA5B4', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {topic.title} · Como foi?
                      </p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {[
                          { id: 'hard'   as ReviewDifficulty, label: 'Difícil', bg: '#FEF2F2', color: '#F04438', border: '#FCA5A5' },
                          { id: 'normal' as ReviewDifficulty, label: 'Normal',  bg: '#FFFBEB', color: '#D97706', border: '#FCD34D' },
                          { id: 'easy'   as ReviewDifficulty, label: 'Fácil',   bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC' },
                        ].map(d => (
                          <button
                            key={d.id}
                            onClick={() => { onReview(topic, d.id); setConfirming(null) }}
                            style={{
                              flex: 1, padding: '8px 4px', borderRadius: 'var(--r-xs)',
                              border: `1.5px solid ${d.border}`,
                              background: d.bg, color: d.color,
                              fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit',
                              transition: 'opacity 0.12s',
                            }}
                          >
                            {d.label}
                          </button>
                        ))}
                        <button
                          onClick={() => setConfirming(null)}
                          style={{
                            padding: '8px 10px', borderRadius: 'var(--r-xs)',
                            border: '1.5px solid var(--bdr-2)',
                            background: '#fff', color: '#9BA5B4',
                            cursor: 'pointer', fontFamily: 'inherit',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* Normal row */
                    <motion.div
                      key="row"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="review-row"
                      style={{ borderBottom: isLast ? 'none' : '1px solid var(--bdr)' }}
                    >
                      <div
                        style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: subjectColor, flexShrink: 0, marginTop: 2,
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
                        onClick={() => setConfirming(topic.id)}
                        className="btn-icon"
                        title="Revisar agora"
                        style={{ color: subjectColor }}
                      >
                        <RefreshCw size={14} />
                      </button>

                      <button
                        onClick={() => onDismiss(topic)}
                        className="btn-icon"
                        title="Dispensar revisão"
                        style={{ color: '#C2CAD8' }}
                      >
                        <X size={13} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {topics.length > VISIBLE && (
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              width: '100%', padding: '10px 16px',
              border: 'none', borderTop: '1px solid var(--bdr)',
              background: 'transparent', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, color: '#9BA5B4',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {expanded
              ? <><ChevronUp size={13} /> Mostrar menos</>
              : <><ChevronDown size={13} /> Ver mais {hidden} revisão{hidden !== 1 ? 'ões' : ''}</>
            }
          </button>
        )}
      </div>
    </div>
  )
}
