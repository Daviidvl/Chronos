import { useEffect, useState, useCallback } from 'react'
import { format, addDays } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { PomodoroTimer } from '@/components/estudos/PomodoroTimer'
import { GuidedSession } from '@/components/estudos/GuidedSession'
import type { Subject, Topic } from '@/types'

export default function TimerPage() {
  const [subjects,   setSubjects]   = useState<Subject[]>([])
  const [topics,     setTopics]     = useState<Topic[]>([])
  const [userId,     setUserId]     = useState('')
  const [subjectId,  setSubjectId]  = useState<string | null>(null)

  const activeDay = (new Date().getDay() + 6) % 7

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const [{ data: subs }, { data: tops }] = await Promise.all([
        supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('topics').select('*, subject:subjects(*)').eq('user_id', user.id),
      ])
      if (subs) setSubjects(subs as Subject[])
      if (tops) setTopics(tops as Topic[])
    })
  }, [])

  const toggleTopic = useCallback(async (topic: Topic, done: boolean) => {
    const supabase = createClient()
    const updates: Partial<Topic> = {
      completed:       done,
      completed_at:    done ? new Date().toISOString() : null,
      review_date:     done ? format(addDays(new Date(), 1), 'yyyy-MM-dd') : null,
      review_interval: done ? 1 : null,
    }
    await supabase.from('topics').update(updates).eq('id', topic.id)
    setTopics(ts => ts.map(t => t.id === topic.id ? { ...t, ...updates } : t))
  }, [])

  return (
    <div className="page">
      <PomodoroTimer
        subjects={subjects}
        userId={userId}
        onSessionSaved={() => {}}
        onSubjectChange={setSubjectId}
      />
      <GuidedSession
        subjects={subjects}
        topics={topics}
        subjectId={subjectId}
        activeDay={activeDay}
        onToggle={toggleTopic}
      />
    </div>
  )
}
