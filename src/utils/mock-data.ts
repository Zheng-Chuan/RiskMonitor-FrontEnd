import type { HomeFeature, SettingSection, WorkspaceAgentDetail, WorkspaceEdge, WorkspaceEvent, WorkspaceKpi, WorkspaceNode, WorkspaceTaskSummary } from '@/types'

export const homeFeatures: HomeFeature[] = [
  {
    id: 'lead',
    title: 'Lead 调度中枢',
    description: '汇总任务目标、拆解执行阶段，并分发给不同角色持续协作。',
  },
  {
    id: 'research',
    title: 'Research 产物流水线',
    description: '沉淀调研报告、技术选型和依赖建议，作为工程实现输入。',
  },
  {
    id: 'delivery',
    title: '工程交付闭环',
    description: '串联编码、测试、审查和界面验证，让任务状态一页可见。',
  },
]

export const workspaceKpis: WorkspaceKpi[] = [
  { id: 'active-tasks', label: '活跃任务', value: '12', hint: '4 个高优先级任务并行中' },
  { id: 'online-agents', label: '在线角色', value: '6', hint: 'Lead 已调度全部专家' },
  { id: 'artifacts', label: '今日产物', value: '28', hint: '包含报告、Diff、测试记录' },
]

export const workspaceTasks: WorkspaceTaskSummary[] = [
  {
    id: 'task-risk-dashboard',
    title: '搭建风险监控工作台首屏',
    status: 'in_progress',
    priority: 'high',
    phase: '编码中',
    ownerRole: 'engineer',
    progress: 72,
    updatedAtLabel: '5 分钟前',
  },
  {
    id: 'task-research-sse',
    title: '调研 SSE 推送协议和错误恢复策略',
    status: 'completed',
    priority: 'medium',
    phase: '调研完成',
    ownerRole: 'researcher',
    progress: 100,
    updatedAtLabel: '12 分钟前',
  },
  {
    id: 'task-ui-check',
    title: '验证 Figma 风格三栏布局一致性',
    status: 'pending',
    priority: 'medium',
    phase: '待分配',
    ownerRole: 'ui_operator',
    progress: 0,
    updatedAtLabel: '刚刚',
  },
]

export const workspaceNodes: WorkspaceNode[] = [
  {
    id: 'lead',
    type: 'agentNode',
    position: { x: 280, y: 30 },
    data: {
      role: 'lead',
      title: 'Lead Agent',
      status: 'working',
      subtitle: '任务拆解与调度',
    },
  },
  {
    id: 'researcher',
    type: 'agentNode',
    position: { x: 40, y: 180 },
    data: {
      role: 'researcher',
      title: 'Researcher',
      status: 'completed',
      subtitle: '调研资料与选型',
    },
  },
  {
    id: 'engineer',
    type: 'agentNode',
    position: { x: 280, y: 180 },
    data: {
      role: 'engineer',
      title: 'Engineer',
      status: 'working',
      subtitle: '代码骨架与交互实现',
    },
  },
  {
    id: 'reviewer',
    type: 'agentNode',
    position: { x: 520, y: 180 },
    data: {
      role: 'reviewer',
      title: 'Reviewer',
      status: 'assigned',
      subtitle: '等待代码审查',
    },
  },
  {
    id: 'qa',
    type: 'agentNode',
    position: { x: 180, y: 340 },
    data: {
      role: 'qa',
      title: 'QA',
      status: 'assigned',
      subtitle: '测试方案准备中',
    },
  },
  {
    id: 'ui_operator',
    type: 'agentNode',
    position: { x: 420, y: 340 },
    data: {
      role: 'ui_operator',
      title: 'UI Operator',
      status: 'idle',
      subtitle: '等待界面检查',
    },
  },
]

export const workspaceEdges: WorkspaceEdge[] = [
  { id: 'lead-researcher', source: 'lead', target: 'researcher', label: '调研' },
  { id: 'lead-engineer', source: 'lead', target: 'engineer', label: '实现' },
  { id: 'lead-reviewer', source: 'lead', target: 'reviewer', label: '审查' },
  { id: 'engineer-qa', source: 'engineer', target: 'qa', label: '测试验证' },
  { id: 'engineer-ui', source: 'engineer', target: 'ui_operator', label: '视觉检查' },
  { id: 'reviewer-qa', source: 'reviewer', target: 'qa', label: '质量闭环' },
]

export const workspaceAgentDetails: WorkspaceAgentDetail[] = [
  {
    id: 'lead',
    role: 'lead',
    name: 'Lead Agent',
    status: 'working',
    currentTask: '正在调度风险监控工作台首版骨架',
    summary: '负责拆分任务阶段、协调专家角色和维护整体进度。',
    metrics: ['活跃子任务 5', '已分配角色 6', '当前阶段 编码中'],
    outputTitle: '调度摘要',
    outputSummary: '已完成 Figma 风格布局拆解，下一步推进页面骨架和状态映射。',
    artifacts: [
      {
        id: 'artifact-brief',
        title: '任务分解清单',
        type: 'document',
        summary: '首页、工作台、设置页与右侧详情面板的开发顺序。',
      },
      {
        id: 'artifact-plan',
        title: '阶段路线图',
        type: 'report',
        summary: '静态原型先行，随后再接入 Zustand 与 SSE。',
      },
    ],
  },
  {
    id: 'engineer',
    role: 'engineer',
    name: 'Engineer',
    status: 'working',
    currentTask: '实现工作台三栏布局和核心业务面板',
    summary: '聚焦路由、组件分层、页面骨架和样式变量。',
    metrics: ['代码文件 9', '待接入接口 3', '构建状态 Ready'],
    outputTitle: '实现摘要',
    outputSummary: '已完成路由骨架设计，正在搭工作台画布与面板区。',
    artifacts: [
      {
        id: 'artifact-skeleton',
        title: '页面骨架',
        type: 'code',
        summary: '基于 Figma 风格的 Header、Sidebar、Canvas、Detail Panel。',
      },
      {
        id: 'artifact-diff',
        title: '组件 Diff',
        type: 'diff',
        summary: '新增页面目录与业务组件层，实现后续易于接入真实数据。',
      },
    ],
  },
]

export const workspaceEvents: WorkspaceEvent[] = [
  {
    id: 'event-1',
    time: '10:32',
    title: 'Lead 已分配页面骨架任务',
    description: '将首页、工作台、设置页拆解为独立页面模块。',
    tone: 'info',
  },
  {
    id: 'event-2',
    time: '10:36',
    title: 'Researcher 输出布局建议',
    description: '确认三栏工作台与底部事件流更符合多智能体协作场景。',
    tone: 'success',
  },
  {
    id: 'event-3',
    time: '10:40',
    title: 'Reviewer 等待代码提交',
    description: '将针对组件分层、路由结构和状态边界进行审查。',
    tone: 'warning',
  },
]

export const settingsSections: SettingSection[] = [
  {
    id: 'runtime',
    title: '运行配置',
    description: '管理工作台运行所需的基础服务与环境配置。',
    items: [
      {
        id: 'sse-endpoint',
        label: 'SSE 服务地址',
        value: 'https://risk-monitor.example.com/sse',
        hint: '后续通过 src/api/sse-client.ts 接入实际推送流。',
      },
      {
        id: 'workspace-theme',
        label: '工作台主题',
        value: 'Figma Dark + Indigo Accent',
        hint: '保持原型的高对比信息密度和角色状态区分。',
      },
    ],
  },
  {
    id: 'agents',
    title: '角色配置',
    description: '控制多智能体默认启用状态与展示策略。',
    items: [
      {
        id: 'agent-set',
        label: '启用角色',
        value: 'Lead / Researcher / Engineer / QA / Reviewer / UI Operator',
        hint: '每个角色拥有独立状态空间与产物展示区。',
      },
      {
        id: 'default-entry',
        label: '默认落地页',
        value: '/workspace',
        hint: '进入系统后优先打开协作工作台。',
      },
    ],
  },
]
