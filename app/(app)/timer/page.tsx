import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PomodoroTimer } from '@/components/estudos/PomodoroTimer'
import type { Subject } from '@/types'

export default function TimerPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [userId,   setUserId]   = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at')
        .then(({ data }) => { if (data) setSubjects(data as Subject[]) })
    })
  }, [])

  return (
    <div className="page">
      <PomodoroTimer
        subjects={subjects}
        userId={userId}
        onSessionSaved={() => {}}
      />
    </div>
  )
}
