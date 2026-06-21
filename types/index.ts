export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  date: string
  start_time: string | null
  end_time: string | null
  category_id: string | null
  completed: boolean
  created_at: string
  category?: Category
}

export interface Habit {
  id: string
  user_id: string
  name: string
  color: string
  active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string
  completed: boolean
}

export interface HabitWithLog extends Habit {
  logs: HabitLog[]
}
