import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, ChevronRight } from 'lucide-react'
import type { Flashcard } from '@/types'
import { nextReviewInterval } from '@/lib/utils'
import { format, addDays } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

type Difficulty = 'hard' | 'normal' | 'easy'

interface Props {
  cards: Flashcard[]
  onDone: (remaining: Flashcard[]) => void
}

export function FlashcardReview({ cards, onDone }: Props) {
  const [index,    setIndex]    = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done,     setDone]     = useState<string[]>([])

  const card = cards[index]
  if (!card) return null

  const progress = Math.round((done.length / cards.length) * 100)

  const rate = async (difficulty: Difficulty) => {
    let next: number
    if (difficulty === 'hard') {
      next = 1
    } else if (difficulty === 'easy') {
      const first = nextReviewInterval(card.review_interval)
      next = nextReviewInterval(first)
    } else {
      next = nextReviewInterval(card.review_interval)
    }

    const nextDate = format(addDays(new Date(), next), 'yyyy-MM-dd')
    const supabase = createClient()
    await supabase
      .from('flashcards')
      .update({ review_interval: next, review_date: nextDate })
      .eq('id', card.id)

    const newDone = [...done, card.id]
    setDone(newDone)
    setRevealed(false)

    if (index + 1 >= cards.length) {
      onDone(cards.filter(c => !newDone.includes(c.id)))
    } else {
      setIndex(i => i + 1)
    }
  }

  const skip = () => {
    setRevealed(false)
    setIndex(i => (i + 1) % cards.length)
  }

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 14 }}>
        <h2 className="section-title">Flashcards</h2>
        <span className="badge-pill" style={{ background: '#EDE9FE', color: '#6E5CF6' }}>
          {cards.length - done.length} restantes
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#E9ECF2', borderRadius: 99, marginBottom: 16 }}>
        <motion.div
          style={{ height: '100%', borderRadius: 99, background: '#6E5CF6' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id + String(revealed)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="card"
          style={{ minHeight: 160 }}
        >
          {/* Subject tag */}
          {card.topic?.subject && (
            <p style={{ fontSize: 10, fontWeight: 700, color: card.topic.subject.color, marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {card.topic.subject.name} · {card.topic.title}
            </p>
          )}

          {/* Question */}
          <p style={{ fontSize: 15, fontWeight: 600, color: '#121826', lineHeight: 1.5, marginBottom: revealed ? 16 : 0 }}>
            {card.question}
          </p>

          {/* Answer */}
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ borderTop: '1px solid var(--bdr)', paddingTop: 14 }}>
                  <p style={{ fontSize: 10, color: '#9BA5B4', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Resposta
                  </p>
                  <p style={{ fontSize: 14, color: '#121826', lineHeight: 1.6 }}>
                    {card.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      {!revealed ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={() => setRevealed(true)}
            className="btn btn-brand"
            style={{ gap: 8 }}
          >
            <Eye size={15} />
            Revelar resposta
          </button>
          <button
            onClick={skip}
            className="btn btn-ghost"
            style={{ width: 'auto', padding: '0 16px' }}
            title="Próximo"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[
            { id: 'hard'   as Difficulty, label: 'Difícil', bg: '#FEF2F2', color: '#F04438', border: '#FCA5A5' },
            { id: 'normal' as Difficulty, label: 'Normal',  bg: '#FFFBEB', color: '#D97706', border: '#FCD34D' },
            { id: 'easy'   as Difficulty, label: 'Fácil',   bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC' },
          ].map(d => (
            <button
              key={d.id}
              onClick={() => rate(d.id)}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 'var(--r-xs)',
                border: `1.5px solid ${d.border}`,
                background: d.bg, color: d.color,
                fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      <p style={{ fontSize: 11, color: '#C2CAD8', textAlign: 'center', marginTop: 10 }}>
        {index + 1} de {cards.length}
      </p>
    </div>
  )
}
