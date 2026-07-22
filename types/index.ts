export interface Subject {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  daily_goal_minutes: number
  created_at: string
}

export interface Topic {
  id: string
  user_id: string
  subject_id: string
  title: string
  estimated_minutes: number
  completed: boolean
  completed_at: string | null
  day_of_week: number | null
  created_at: string
  subject?: Subject
}

export interface StudySession {
  id: string
  user_id: string
  subject_id: string | null
  date: string
  duration_minutes: number
  created_at: string
}

export interface SubjectSchedule {
  id: string
  user_id: string
  subject_id: string
  day_of_week: number
  created_at: string
}

export interface DayCompletion {
  id: string
  user_id: string
  date: string
  created_at: string
}

