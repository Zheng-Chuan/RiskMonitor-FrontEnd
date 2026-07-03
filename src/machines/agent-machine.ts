// machines/agent-machine.ts

import { createMachine } from 'xstate'

/** 智能体工作流状态机：idle → assigned → working → completed/failed/cancelled */
export const agentMachine = createMachine({
  id: 'agent',
  initial: 'idle',
  states: {
    idle: {
      on: { ASSIGN: 'assigned' },
    },
    assigned: {
      on: { START: 'working' },
    },
    working: {
      on: {
        COMPLETE: 'completed',
        ERROR: 'failed',
        CANCEL: 'cancelled',
      },
    },
    completed: { type: 'final' },
    failed: {
      on: { RETRY: 'assigned' },
    },
    cancelled: { type: 'final' },
  },
})
