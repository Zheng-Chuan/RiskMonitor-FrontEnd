import '@xyflow/react/dist/style.css'

import type { NodeProps, NodeTypes } from '@xyflow/react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
} from '@xyflow/react'

import { StatusBadge } from '@/components/base/status-badge'
import { SurfaceCard } from '@/components/base/surface-card'
import type { WorkspaceEdge, WorkspaceNode } from '@/types'
import { getAgentRoleLabel, getStatusLabel } from '@/utils/workspace-presenters'

import styles from './workspace-canvas.module.css'

function AgentCanvasNode({ data }: NodeProps<WorkspaceNode>) {
  return (
    <div className={styles.nodeCard}>
      <div className={styles.nodeHeader}>
        <div>
          <span className={styles.nodeRole}>{getAgentRoleLabel(data.role)}</span>
          <strong className={styles.nodeTitle}>{data.title}</strong>
        </div>
        <StatusBadge label={getStatusLabel(data.status)} tone={data.status} />
      </div>
      <p className={styles.nodeSubtitle}>{data.subtitle}</p>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  agentNode: AgentCanvasNode,
}

interface WorkspaceCanvasProps {
  nodes: WorkspaceNode[]
  edges: WorkspaceEdge[]
}

export function WorkspaceCanvas({ nodes, edges }: WorkspaceCanvasProps) {
  const preparedEdges = edges.map((edge) => ({
    ...edge,
    markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
    animated: edge.source === 'lead',
  }))

  return (
    <SurfaceCard
      title="多智能体协作画布"
      eyebrow="Canvas"
      aside={<span className={styles.canvasHint}>Figma 风格主工作区</span>}
      className={styles.canvasCard}
    >
      <div className={styles.canvasFrame}>
        <ReactFlow
          fitView
          nodes={nodes}
          edges={preparedEdges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
        >
          <Background
            gap={24}
            size={1}
            color="rgba(148, 163, 184, 0.14)"
            variant={BackgroundVariant.Dots}
          />
          <MiniMap
            pannable={false}
            zoomable={false}
            maskColor="rgba(2, 6, 23, 0.45)"
            className={styles.miniMap}
          />
          <Controls showInteractive={false} className={styles.controls} />
        </ReactFlow>
      </div>
    </SurfaceCard>
  )
}
