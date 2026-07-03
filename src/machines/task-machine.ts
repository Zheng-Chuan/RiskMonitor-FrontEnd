// machines/task-machine.ts

import { createMachine } from 'xstate'

/** 任务状态机：pending → in_progress → completed/failed/cancelled */
export const taskMachine = createMachine({
  id: 'task',
  initial: 'pending',
  states: {
    pending: {
      on: { START: 'in_progress' },
    },
    in_progress: {
      on: {
        COMPLETE: 'completed',
        FAIL: 'failed',
        CANCEL: 'cancelled',
      },
    },
    completed: { type: 'final' },
    failed: {
      on: { RETRY: 'in_progress' },
    },
    cancelled: { type: 'final' },
  },
})
