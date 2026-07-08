import { useEffect, useState } from 'react'
import { format, addDays } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { calcStreak, todayISO } from '@/lib/utils'
import { StudyHeader } from '@/components/estudos/StudyHeader'
import { StudyStats }  from '@/components/estudos/StudyStats'
import type { Topic, StudySession } from '@/types'

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skel" style={{ height: 180, borderRadius: 'var(--r-lg)' }} />
      <div className="stat-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="skel" style={{ height: 90, borderRadius: 'var(--r)' }} />
        ))}
      </div>
    </div>
  )
}

export default function ProgressoPage() {
  const [topics,   setTopics]   = useState<Topic[]>([])
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [streak,   setStreak]   = useState(0)
  const [loading,  setLoading]  = useState(true)

  const today = todayISO()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const sixtyAgo = format(addDays(new Date(), -60), 'yyyy-MM-dd')

      const [
        { data: topicsData },
        { data: sessionsData },
        { data: streakData },
      ] = await Promise.all([
        supabase.from('topics').select('*').eq('user_id', user.id),
        supabase.from('study_sessions').select('*').eq('user_id', user.id).eq('date', today),
        supabase.from('study_sessions').select('date').eq('user_id', user.id).gte('date', sixtyAgo),
      ])

      setTopics((topicsData as Topic[]) ?? [])
      setSessions((sessionsData as StudySession[]) ?? [])
      setStreak(calcStreak((streakData ?? []).map((r: { date: string }) => r.date)))
      setLoading(false)
    })
  }, [today])

  const todayDayOfWeek        = (new Date().getDay() + 6) % 7
  const todayTopics           = topics.filter(t => t.day_of_week === todayDayOfWeek)
  const completedTodayMinutes = todayTopics.filter(t => t.completed).reduce((s, t) => s + t.estimated_minutes, 0)
  const totalTodayMinutes     = todayTopics.reduce((s, t) => s + t.estimated_minutes, 0)
  const pomodoroMinutes       = sessions.reduce((s, se) => s + se.duration_minutes, 0)

  if (loading) return <div className="page"><Skeleton /></div>

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <StudyHeader
        todayMinutes={completedTodayMinutes}
        goalMinutes={totalTodayMinutes}
      />
      <StudyStats
        streak={streak}
        todayMinutes={completedTodayMinutes}
        weekMinutes={pomodoroMinutes}
        weekGoalMinutes={0}
      />
    </div>
  )
}
