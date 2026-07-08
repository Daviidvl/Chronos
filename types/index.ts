export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  user_id: string
  title: string
  date: string
  start_time: string | null
  end_time: string | null
  category_id: string | null
  completed: boolean
  priority: Priority
  created_at: string
  category?: Category
}

export interface Habit {
  id: string
  user_id: string
  name: string
  color: string
  active: boolean
  time?: string | null
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  completed: boolean
}

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
  review_date: string | null
  review_interval: number | null
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

export interface Flashcard {
  id: string
  user_id: string
  topic_id: string
  question: string
  answer: string
  review_interval: number
  review_date: string
  created_at: string
  topic?: Topic
}

