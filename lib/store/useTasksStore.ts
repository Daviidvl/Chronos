import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task } from '@/types'
import { generateId, todayISO } from '@/lib/utils'

interface TasksState {
  tasks: Task[]
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'order'>) => void
  updateTask: (id: string, u: Partial<Task>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
}

const T = todayISO()

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [
        { id: 't1', title: 'Revisar plano de treino',        priority: 'high',   category: 'saude',   completed: false, important: true,  order: 0, createdAt: T, dueDate: T },
        { id: 't2', title: 'Estudar React Server Components', priority: 'medium', category: 'estudos', completed: false, important: false, order: 1, createdAt: T, dueDate: T },
        { id: 't3', title: 'Agendar consulta médica',         priority: 'medium', category: 'saude',   completed: false, important: false, order: 2, createdAt: T },
        { id: 't4', title: 'Transferir para reserva',         priority: 'high',   category: 'financas',completed: true,  important: true,  order: 3, createdAt: T, completedAt: T },
        { id: 't5', title: 'Ler capítulo 4',                  priority: 'low',    category: 'estudos', completed: false, important: false, order: 4, createdAt: T },
      ],
      addTask: (t) => {
        const tasks = get().tasks
        const order = tasks.length ? Math.max(...tasks.map(x => x.order)) + 1 : 0
        set(s => ({ tasks: [...s.tasks, { ...t, id: generateId(), completed: false, order, createdAt: todayISO() }] }))
      },
      updateTask: (id, u) => set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...u } : t) })),
      toggleTask: (id) => set(s => ({
        tasks: s.tasks.map(t => t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? todayISO() : undefined }
          : t)
      })),
      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),
    }),
    { name: 'chronos-tasks-v2' }
  )
)
