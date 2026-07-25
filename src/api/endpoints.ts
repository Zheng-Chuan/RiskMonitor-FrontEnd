// api/endpoints.ts

/** API 端点常量定义 */
export const API_ENDPOINTS = {
  /** 创建任务 */
  createTask: '/api/tasks',
  /** 获取任务详情 */
  getTask: (id: string) => "/api/tasks/" + id,
  /** 获取任务图 */
  getTaskGraph: (id: string) => "/api/tasks/" + id + '/graph',
  /** 获取任务记忆 */
  getTaskMemory: (id: string) => "/api/tasks/" + id + '/memory',
  /** 获取任务列表 */
  getTasks: '/api/tasks',
  /** 获取最近记忆 */
  getMemory: '/api/memory',
  /** 获取智能体列表 */
  getAgents: '/api/agents',
  /** SSE 事件流 */
  stream: '/api/stream',
} as const
