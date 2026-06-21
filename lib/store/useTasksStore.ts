import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task, TaskPriority, TaskCategory } from '@/types'
import { generateId, todayISO } from '@/lib/utils'

interface TasksState {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'completedAt' | 'order'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  reorderTasks: (ids: string[]) => void
  getTodayTasks: () => Task[]
  getImportantTasks: () => Task[]
  getCompletedTasks: () => Task[]
  getPendingTasks: () => Task[]
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [
        {
          id: 't1',
          title: 'Revisar plano de treino da semana',
          priority: 'high',
          category: 'health',
          completed: false,
          important: true,
          order: 0,
          createdAt: new Date().toISOString(),
          dueDate: todayISO(),
        },
        {
          id: 't2',
          title: 'Estudar React Server Components',
          priority: 'medium',
          category: 'study',
          completed: false,
          important: false,
          order: 1,
          createdAt: new Date().toISOString(),
          dueDate: todayISO(),
        },
        {
          id: 't3',
          title: 'Fazer transferência para reserva de emergência',
          priority: 'high',
          category: 'finance',
          completed: true,
          completedAt: new Date().toISOString(),
          important: true,
          order: 2,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 't4',
          title: 'Agendar consulta médica',
          priority: 'medium',
          category: 'health',
          completed: false,
          important: false,
          order: 3,
          createdAt: new Date().toISOString(),
        },
        {
          id: 't5',
          title: 'Ler capítulo 3 do livro atual',
          priority: 'low',
          category: 'personal',
          completed: false,
          important: false,
          order: 4,
          createdAt: new Date().toISOString(),
          dueDate: todayISO(),
        },
      ],

      addTask: (task) => {
        const tasks = get().tasks
        const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) + 1 : 0
        set(s => ({
          tasks: [...s.tasks, {
            ...task,
            id: generateId(),
            completed: false,
            order: maxOrder,
            createdAt: new Date().toISOString(),
          }],
        }))
      },

      updateTask: (id, updates) => {
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t) }))
      },

      toggleTask: (id) => {
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id
              ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined }
              : t
          ),
        }))
      },

      deleteTask: (id) => {
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
      },

      reorderTasks: (ids) => {
        set(s => ({
          tasks: s.tasks.map(t => ({ ...t, order: ids.indexOf(t.id) })),
        }))
      },

      getTodayTasks: () => {
        const today = todayISO()
        return get().tasks.filter(t => !t.completed && t.dueDate === today).sort((a, b) => a.order - b.order)
      },

      getImportantTasks: () => {
        return get().tasks.filter(t => !t.completed && t.important).sort((a, b) => a.order - b.order)
      },

      getCompletedTasks: () => {
        return get().tasks.filter(t => t.completed).sort((a, b) =>
          new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime()
        )
      },

      getPendingTasks: () => {
        return get().tasks.filter(t => !t.completed).sort((a, b) => a.order - b.order)
      },
    }),
    { name: 'chronos-tasks' }
  )
)
