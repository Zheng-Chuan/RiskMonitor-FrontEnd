// store/agent-store.ts

import { create } from 'zustand'
import type { Agent } from '../types'

interface AgentStoreState {
  agents: Record<string, Agent>
  activeAgentIds: string[]
  leadAgentId: string | null

  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  setActiveAgents: (ids: string[]) => void
  setLeadAgent: (id: string | null) => void
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  agents: {},
  activeAgentIds: [],
  leadAgentId: null,

  addAgent: (agent) =>
    set((state) => ({
      agents: { ...state.agents, [agent.id]: agent },
    })),

  updateAgent: (id, updates) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], ...updates },
      },
    })),

  setActiveAgents: (ids) => set({ activeAgentIds: ids }),

  setLeadAgent: (id) => set({ leadAgentId: id }),
}))
