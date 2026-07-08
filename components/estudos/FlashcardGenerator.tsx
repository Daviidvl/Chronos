import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Trash2, Check, RotateCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO } from '@/lib/utils'
import type { Topic, Subject } from '@/types'

interface Draft {
  question: string
  answer: string
}

interface Props {
  topic:   Topic
  subject: Subject
  userId:  string
  onClose: () => void
  onSaved: (count: number) => void
}

export function FlashcardGenerator({ topic, subject, userId, onClose, onSaved }: Props) {
  const [drafts,   setDrafts]   = useState<Draft[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [saving,   setSaving]   = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(null)
    setDrafts([])
    try {
      const supabase = createClient()
      const { data, error: fnError } = await supabase.functions.invoke('generate-flashcards', {
        body: { topicTitle: topic.title, subjectName: subject.name },
      })
      if (fnError) throw fnError
      if (!data?.flashcards?.length) throw new Error('Nenhum flashcard gerado')
      setDrafts(data.flashcards as Draft[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generate() }, [])

  const updateDraft = (i: number, field: 'question' | 'answer', val: string) => {
    setDrafts(d => d.map((c, idx) => idx === i ? { ...c, [field]: val } : c))
  }

  const removeDraft = (i: number) => {
    setDrafts(d => d.filter((_, idx) => idx !== i))
  }

  const save = async () => {
    if (drafts.length === 0) return
    setSaving(true)
    const supabase = createClient()
    const today = todayISO()
    await supabase.from('flashcards').insert(
      drafts.map(d => ({
        user_id:         userId,
        topic_id:        topic.id,
        question:        d.question.trim(),
        answer:          d.answer.trim(),
        review_interval: 1,
        review_date:     today,
      }))
    )
    onSaved(drafts.length)
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="sheet-overlay" onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 42 }}
        className="sheet-container"
        style={{ maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="sheet-body" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="sheet-handle" />

          {/* Header */}
          <div className="sheet-header">
            <div>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#121826', letterSpacing: '-0.3px' }}>
                Flashcards
              </span>
              <p style={{ fontSize: 12, color: '#9BA5B4', marginTop: 2 }}>
                {topic.title} · {subject.name}
              </p>
            </div>
            <button onClick={onClose} className="btn-icon"><X size={16} /></button>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
              <div className="spinner" />
              <p style={{ fontSize: 13, color: '#9BA5B4' }}>Gerando flashcards com IA…</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontSize: 13, color: '#F04438', marginBottom: 16 }}>{error}</p>
              <button onClick={generate} className="btn btn-ghost" style={{ width: 'auto', padding: '0 20px' }}>
                <RotateCcw size={14} /> Tentar novamente
              </button>
            </div>
          )}

          {/* Cards */}
          <AnimatePresence mode="popLayout">
            {drafts.map((draft, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ delay: i * 0.06 }}
                style={{
                  border: '1.5px solid var(--bdr-2)',
                  borderRadius: 'var(--r)',
                  padding: 14,
                  marginBottom: 10,
                  background: '#fff',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#6E5CF6',
                    background: '#EDE9FE', padding: '2px 8px', borderRadius: 99,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    Card {i + 1}
                  </span>
                  <button onClick={() => removeDraft(i)} className="btn-icon danger" style={{ padding: 4 }}>
                    <Trash2 size={12} />
                  </button>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label className="form-label" style={{ marginBottom: 4 }}>Pergunta</label>
                  <textarea
                    value={draft.question}
                    onChange={e => updateDraft(i, 'question', e.target.value)}
                    className="field"
                    rows={2}
                    style={{ resize: 'none', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: 4 }}>Resposta</label>
                  <textarea
                    value={draft.answer}
                    onChange={e => updateDraft(i, 'answer', e.target.value)}
                    className="field"
                    rows={3}
                    style={{ resize: 'none', fontSize: 13 }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Regenerate */}
          {!loading && drafts.length > 0 && (
            <button
              onClick={generate}
              className="btn btn-ghost"
              style={{ width: '100%', marginBottom: 8, gap: 8, fontSize: 13 }}
            >
              <Sparkles size={14} />
              Gerar novamente
            </button>
          )}
        </div>

        {/* Save footer */}
        {!loading && drafts.length > 0 && (
          <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--bdr)' }}>
            <button
              onClick={save}
              disabled={saving}
              className="btn btn-brand"
              style={{ gap: 8 }}
            >
              <Check size={15} />
              {saving ? 'Salvando…' : `Salvar ${drafts.length} flashcard${drafts.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}
