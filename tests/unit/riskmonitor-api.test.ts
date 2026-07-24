import { createDraftTask, mapTaskDetail } from '@/api/riskmonitor-api'

describe('riskmonitor-api mappings', () => {
  it('creates a pending draft task from submit response', () => {
    const task = createDraftTask('task_123', '查询所有 desk 头寸', 1_724_800_000_000)

    expect(task.id).toBe('task_123')
    expect(task.title).toBe('查询所有 desk 头寸')
    expect(task.status).toBe('pending')
    expect(task.steps).toEqual([])
    expect(task.updatedAt).toBe(1_724_800_000_000)
  })

  it('maps backend task detail into frontend task model', () => {
    const mapped = mapTaskDetail({
      id: 'task_456',
      title: 'desk 风险汇总',
      description: '查询所有 desk 头寸并汇总风险暴露',
      status: 'running',
      steps: [
        {
          id: 'step_1',
          title: 'delegate system_engineer',
          status: 'completed',
        },
        {
          id: 'step_2',
          title: 'delegate risk_analyst',
          status: 'running',
        },
      ],
      result: {
        summary: '系统已经开始分析',
        artifacts: [
          {
            id: 'artifact_1',
            type: 'report',
            title: '阶段报告',
            content: '当前已经完成基础分析',
          },
        ],
      },
      error: null,
      created_at: 1_724_800_000_000,
      updated_at: 1_724_800_001_000,
    })

    expect(mapped.id).toBe('task_456')
    expect(mapped.status).toBe('in_progress')
    expect(mapped.resultSummary).toBe('系统已经开始分析')
    expect(mapped.steps).toEqual([
      {
        id: 'step_1',
        title: 'delegate system_engineer',
        status: 'completed',
      },
      {
        id: 'step_2',
        title: 'delegate risk_analyst',
        status: 'in_progress',
      },
    ])
    expect(mapped.artifacts).toHaveLength(1)
    expect(mapped.artifacts[0]).toMatchObject({
      id: 'artifact_1',
      type: 'report',
      title: '阶段报告',
      content: '当前已经完成基础分析',
    })
  })

  it('maps completed backend task with error-safe fallback fields', () => {
    const mapped = mapTaskDetail({
      id: 'task_789',
      description: '生成日报',
      status: 'completed',
      result: null,
      error: null,
      created_at: 1_724_800_000_000,
      updated_at: 1_724_800_002_000,
    })

    expect(mapped.title).toBe('生成日报')
    expect(mapped.status).toBe('completed')
    expect(mapped.completedAt).toBe(1_724_800_002_000)
    expect(mapped.artifacts).toEqual([])
    expect(mapped.steps).toEqual([])
  })
})
