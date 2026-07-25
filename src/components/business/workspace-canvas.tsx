import '@xyflow/react/dist/style.css'

import { useMemo, useState } from 'react'

import type { Edge, Node, NodeProps } from '@xyflow/react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
} from '@xyflow/react'

import type { TaskGraphEdge, TaskGraphNode, TaskGraphSnapshot, TaskGraphStatus } from '@/types'
import { formatTimestamp } from '@/utils/format'

import styles from './workspace-canvas.module.css'

interface WorkspaceCanvasProps {
  graph?: TaskGraphSnapshot
}

interface CanvasNodeData extends Record<string, unknown> {
  node: TaskGraphNode
}

interface CanvasEdgeData extends Record<string, unknown> {
  edge: TaskGraphEdge
}

function getGraphStatusLabel(status: TaskGraphStatus): string {
  switch (status) {
    case 'ready':
      return '就绪'
    case 'running':
      return '运行中'
    case 'completed':
      return '已完成'
    case 'failed':
      return '失败'
    case 'blocked':
      return '阻塞'
    case 'skipped':
      return '已跳过'
    case 'pending':
    default:
      return '等待中'
  }
}

function buildNodeLabel(node: TaskGraphNode): string {
  if (node.label.trim()) {
    return node.label
  }
  if (node.targetAgent) {
    return node.kind + ' ' + node.targetAgent
  }
  if (node.toolName) {
    return node.kind + ' ' + node.toolName
  }
  return node.id
}

function formatNodeMeta(node: TaskGraphNode): string {
  if (node.targetAgent) {
    return node.targetAgent
  }
  if (node.toolName) {
    return node.toolName
  }
  return node.kind
}

function getStatusClassName(status: TaskGraphStatus): string {
  return styles['status' + status.charAt(0).toUpperCase() + status.slice(1)]
}

function getEdgeColor(status: TaskGraphStatus): string {
  switch (status) {
    case 'completed':
      return '#10b981'
    case 'running':
      return '#0ea5e9'
    case 'failed':
      return '#ef4444'
    case 'blocked':
      return '#f59e0b'
    case 'ready':
      return '#6366f1'
    case 'skipped':
      return '#94a3b8'
    case 'pending':
    default:
      return '#cbd5e1'
  }
}

function buildLayout(nodes: TaskGraphNode[], edges: TaskGraphEdge[]): Node<CanvasNodeData>[] {
  const incoming = new Map<string, string[]>()
  const outgoing = new Map<string, string[]>()
  const indegree = new Map<string, number>()
  const levels = new Map<string, number>()

  nodes.forEach((node) => {
    incoming.set(node.id, [])
    outgoing.set(node.id, [])
    indegree.set(node.id, 0)
    levels.set(node.id, 0)
  })

  edges.forEach((edge) => {
    if (!incoming.has(edge.target) || !outgoing.has(edge.source)) {
      return
    }
    incoming.get(edge.target)?.push(edge.source)
    outgoing.get(edge.source)?.push(edge.target)
    indegree.set(edge.target, (indegree.get(edge.target) ?? 0) + 1)
  })

  const queue = nodes
    .filter((node) => (indegree.get(node.id) ?? 0) === 0)
    .map((node) => node.id)

  while (queue.length > 0) {
    const currentId = queue.shift()
    if (!currentId) {
      continue
    }
    const currentLevel = levels.get(currentId) ?? 0
    for (const nextId of outgoing.get(currentId) ?? []) {
      levels.set(nextId, Math.max(levels.get(nextId) ?? 0, currentLevel + 1))
      indegree.set(nextId, (indegree.get(nextId) ?? 1) - 1)
      if ((indegree.get(nextId) ?? 0) === 0) {
        queue.push(nextId)
      }
    }
  }

  const columnMap = new Map<number, TaskGraphNode[]>()
  nodes.forEach((node) => {
    const level = levels.get(node.id) ?? 0
    const column = columnMap.get(level) ?? []
    column.push(node)
    columnMap.set(level, column)
  })

  const sortedLevels = Array.from(columnMap.keys()).sort((left, right) => left - right)
  const nodeMap = new Map(nodes.map((node) => [node.id, node]))
  const positioned: Node<CanvasNodeData>[] = []

  sortedLevels.forEach((level) => {
    const columnNodes = (columnMap.get(level) ?? []).slice().sort((left, right) => {
      const leftIncoming = (incoming.get(left.id) ?? []).join('|')
      const rightIncoming = (incoming.get(right.id) ?? []).join('|')
      return leftIncoming.localeCompare(rightIncoming) || left.id.localeCompare(right.id)
    })

    columnNodes.forEach((node, index) => {
      positioned.push({
        id: node.id,
        type: 'taskNode',
        position: {
          x: 72 + level * 280,
          y: 44 + index * 156,
        },
        data: {
          node: nodeMap.get(node.id) ?? node,
        },
        draggable: false,
        selectable: true,
      })
    })
  })

  return positioned
}

function TaskGraphNodeCard({ data }: NodeProps<Node<CanvasNodeData>>) {
  const node = data.node
  const label = buildNodeLabel(node)

  return (
    <div className={styles.nodeWrapper}>
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <div className={styles.nodeCard + ' ' + getStatusClassName(node.status)}>
        <div className={styles.nodeHeader}>
          <span className={styles.nodeKind}>{node.kind}</span>
          <span className={styles.nodeStatus}>{getGraphStatusLabel(node.status)}</span>
        </div>
        <strong className={styles.nodeTitle}>{label}</strong>
        <p className={styles.nodeMeta}>{formatNodeMeta(node)}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  )
}

function buildCanvasEdges(edges: TaskGraphEdge[]): Edge<CanvasEdgeData>[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.condition && edge.condition !== 'always' ? edge.condition : undefined,
    animated: edge.status === 'running',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: getEdgeColor(edge.status),
    },
    style: {
      stroke: getEdgeColor(edge.status),
      strokeWidth: edge.status === 'running' ? 3 : 2.4,
    },
    labelStyle: {
      fill: '#475569',
      fontSize: 12,
      fontWeight: 600,
    },
    labelBgStyle: {
      fill: '#ffffff',
      fillOpacity: 0.96,
      stroke: '#e2e8f0',
      strokeWidth: 1,
    },
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 8,
    interactionWidth: 36,
    data: { edge },
  }))
}

function renderJson(value: Record<string, unknown>): string {
  const keys = Object.keys(value)
  if (keys.length === 0) {
    return '{}'
  }
  return JSON.stringify(value, null, 2)
}

export function WorkspaceCanvas({ graph }: WorkspaceCanvasProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null)

  const nodeTypes = useMemo(() => ({ taskNode: TaskGraphNodeCard }), [])
  const canvasNodes = useMemo(() => buildLayout(graph?.nodes ?? [], graph?.edges ?? []), [graph?.edges, graph?.nodes])
  const canvasEdges = useMemo(() => buildCanvasEdges(graph?.edges ?? []), [graph?.edges])
  const hoveredNode = useMemo(() => graph?.nodes.find((node) => node.id === hoveredNodeId) ?? null, [graph?.nodes, hoveredNodeId])
  const hoveredEdge = useMemo(() => graph?.edges.find((edge) => edge.id === hoveredEdgeId) ?? null, [graph?.edges, hoveredEdgeId])

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className={styles.emptyGraph} data-testid="task-graph-placeholder">
        <strong>TaskGraph 还没有准备好</strong>
        <p>规划完成后 这里会直接展示真实执行的有向无环图 包括节点 边 和实时状态.</p>
      </div>
    )
  }

  return (
    <div className={styles.canvasRoot}>
      <div className={styles.canvasMetaRow}>
        <div className={styles.canvasSummary}>
          <span>节点 {graph.summary?.nodeCount ?? graph.nodes.length}</span>
          <span>边 {graph.summary?.edgeCount ?? graph.edges.length}</span>
          <span>运行中 {graph.summary?.runningCount ?? graph.nodes.filter((node) => node.status === 'running').length}</span>
          <span>失败 {graph.summary?.failedCount ?? graph.nodes.filter((node) => node.status === 'failed').length}</span>
        </div>
        <span className={styles.canvasUpdatedAt}>最近图刷新 {formatTimestamp(graph.updatedAt)}</span>
      </div>

      <div className={styles.canvasFrame} data-testid="task-graph-canvas">
        <ReactFlow
          fitView
          fitViewOptions={{ padding: 0.18 }}
          nodes={canvasNodes}
          edges={canvasEdges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          onNodeMouseEnter={(_, node) => {
            setHoveredEdgeId(null)
            setHoveredNodeId(node.id)
          }}
          onNodeMouseLeave={() => {
            setHoveredNodeId(null)
          }}
          onEdgeMouseEnter={(_, edge) => {
            setHoveredNodeId(null)
            setHoveredEdgeId(edge.id)
          }}
          onEdgeMouseLeave={() => {
            setHoveredEdgeId(null)
          }}
          onPaneClick={() => {
            setHoveredNodeId(null)
            setHoveredEdgeId(null)
          }}
        >
          <Background gap={24} size={1} color="rgba(148, 163, 184, 0.22)" variant={BackgroundVariant.Dots} />
          <Controls showInteractive={false} className={styles.controls} />
        </ReactFlow>
      </div>

      <div className={styles.hoverPanel} data-testid="task-graph-hover-panel">
        {hoveredNode ? (
          <>
            <div className={styles.hoverHeader}>
              <strong>节点数据</strong>
              <span className={styles.hoverStatus + ' ' + getStatusClassName(hoveredNode.status)}>{getGraphStatusLabel(hoveredNode.status)}</span>
            </div>
            <div className={styles.hoverMetaGrid}>
              <span>ID {hoveredNode.id}</span>
              <span>类型 {hoveredNode.kind}</span>
              {hoveredNode.targetAgent ? <span>Agent {hoveredNode.targetAgent}</span> : null}
              {hoveredNode.toolName ? <span>工具 {hoveredNode.toolName}</span> : null}
              {hoveredNode.startedAt ? <span>开始 {formatTimestamp(hoveredNode.startedAt)}</span> : null}
              {hoveredNode.finishedAt ? <span>结束 {formatTimestamp(hoveredNode.finishedAt)}</span> : null}
            </div>
            {hoveredNode.reason ? <p className={styles.hoverReason}>{hoveredNode.reason}</p> : null}
            <pre className={styles.hoverCode}>{renderJson(hoveredNode.data)}</pre>
          </>
        ) : null}

        {!hoveredNode && hoveredEdge ? (
          <>
            <div className={styles.hoverHeader}>
              <strong>边数据</strong>
              <span className={styles.hoverStatus + ' ' + getStatusClassName(hoveredEdge.status)}>{getGraphStatusLabel(hoveredEdge.status)}</span>
            </div>
            <div className={styles.hoverMetaGrid}>
              <span>来源 {hoveredEdge.source}</span>
              <span>目标 {hoveredEdge.target}</span>
              <span>条件 {hoveredEdge.condition ?? 'always'}</span>
            </div>
            <pre className={styles.hoverCode}>{renderJson(hoveredEdge.data)}</pre>
          </>
        ) : null}

        {!hoveredNode && !hoveredEdge ? (
          <div className={styles.hoverHint}>
            <strong>悬停查看详情</strong>
            <p>把鼠标移动到节点或边上 这里会显示对应的数据载荷和状态.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
