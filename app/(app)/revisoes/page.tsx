import { useEffect, useState, useCallback } from 'react'
import { format, addDays } from 'date-fns'
import { RefreshCcw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { todayISO } from '@/lib/utils'
import { nextReviewInterval } from '@/lib/utils'
import { RevisionList, type ReviewDifficulty } from '@/components/estudos/RevisionList'
import type { Topic } from '@/types'

export default function RevisoesPage() {
  const [revisions, setRevisions] = useState<Topic[]>([])
  const [loading,   setLoading]   = useState(true)

  const today = todayISO()

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('topics')
      .select('*, subject:subjects(*)')
      .eq('user_id', user.id)
      .eq('completed', true)
      .lte('review_date', today)
      .not('review_date', 'is', null)

    setRevisions((data as Topic[]) ?? [])
    setLoading(false)
  }, [today])

  useEffect(() => { load() }, [load])

  const markReviewed = async (topic: Topic, difficulty: ReviewDifficulty) => {
    let next: number
    if (difficulty === 'hard') {
      next = 1
    } else if (difficulty === 'easy') {
      const first = nextReviewInterval(topic.review_interval)
      next = nextReviewInterval(first)
    } else {
      next = nextReviewInterval(topic.review_interval)
    }
    const nextDate = format(addDays(new Date(), next), 'yyyy-MM-dd')
    const supabase = createClient()
    await supabase.from('topics').update({ review_interval: next, review_date: nextDate }).eq('id', topic.id)
    setRevisions(rs => rs.filter(r => r.id !== topic.id))
  }

  const dismissRevision = async (topic: Topic) => {
    const supabase = createClient()
    await supabase.from('topics').update({ review_date: null, review_interval: null }).eq('id', topic.id)
    setRevisions(rs => rs.filter(r => r.id !== topic.id))
  }

  if (loading) {
    return (
      <div className="page">
        <div className="skel" style={{ height: 200, borderRadius: 'var(--r-lg)' }} />
      </div>
    )
  }

  if (revisions.length === 0) {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <RefreshCcw size={24} style={{ color: '#6E5CF6' }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#121826' }}>Sem revisões pendentes</p>
        <p style={{ fontSize: 13, color: '#9BA5B4', textAlign: 'center', maxWidth: 240 }}>
          Quando você concluir conteúdos, eles aparecerão aqui para revisão.
        </p>
      </div>
    )
  }

  return (
    <div className="page">
      <RevisionList
        topics={revisions}
        onReview={markReviewed}
        onDismiss={dismissRevision}
      />
    </div>
  )
}
