// store/canvas-store.ts

import { create } from 'zustand'
import type { AgentRole, AgentStatus } from '../types'

/** 画布节点 */
export interface CanvasNode {
  id: string
  agentId: string
  role: AgentRole
  position: { x: number; y: number }
  data: { status: AgentStatus; taskCount: number }
}

/** 画布连线 */
export interface CanvasEdge {
  id: string
  source: string
  target: string
  label?: string
}

interface CanvasState {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  selectedNodeId: string | null
  viewport: { x: number; y: number; zoom: number }

  addNode: (node: CanvasNode) => void
  updateNode: (id: string, updates: Partial<CanvasNode>) => void
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void
  setSelectedNode: (id: string | null) => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  viewport: { x: 0, y: 0, zoom: 1 },

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),

  setViewport: (viewport) => set({ viewport }),

  setSelectedNode: (id) => set({ selectedNodeId: id }),
}))
