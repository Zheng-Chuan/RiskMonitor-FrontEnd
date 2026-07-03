// store/task-store.ts

import { create } from 'zustand'
import type { Task, TaskStatus } from '../types'

interface TaskState {
  tasks: Record<string, Task>
  taskOrder: string[]
  activeTaskId: string | null
  filter: TaskStatus | 'all'

  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  setFilter: (filter: TaskStatus | 'all') => void
  setActiveTask: (id: string | null) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: {},
  taskOrder: [],
  activeTaskId: null,
  filter: 'all',

  addTask: (task) =>
    set((state) => ({
      tasks: { ...state.tasks, [task.id]: task },
      taskOrder: [...state.taskOrder, task.id],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: { ...state.tasks[id], ...updates },
      },
    })),

  setFilter: (filter) => set({ filter }),

  setActiveTask: (id) => set({ activeTaskId: id }),
}))
