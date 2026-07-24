import { formatAgentStatus, formatTaskStatus, formatTimestamp } from '@/utils/format'
import { getAgentRoleLabel, getPriorityLabel, getStatusLabel } from '@/utils/workspace-presenters'

describe('workspace presenters', () => {
  it('formats timestamps into hh:mm:ss', () => {
    const timestamp = new Date('2026-07-24T09:08:07.000Z').getTime()
    const formatted = formatTimestamp(timestamp)

    expect(formatted).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })

  it('maps agent and task statuses into readable labels', () => {
    expect(formatAgentStatus('working')).toBe('工作中')
    expect(formatTaskStatus('in_progress')).toBe('执行中')
    expect(getStatusLabel('working')).toBe('进行中')
    expect(getStatusLabel('pending')).toBe('待处理')
  })

  it('maps roles and priorities into display labels', () => {
    expect(getAgentRoleLabel('lead')).toBe('Lead')
    expect(getAgentRoleLabel('engineer')).toBe('Engineer')
    expect(getPriorityLabel('medium')).toBe('中')
    expect(getPriorityLabel('critical')).toBe('紧急')
  })
})
