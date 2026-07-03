// utils/validation.ts

/** 最小任务描述长度 */
const MIN_DESCRIPTION_LENGTH = 1

/** 最大任务描述长度 */
const MAX_DESCRIPTION_LENGTH = 2000

/** 验证任务描述是否有效 */
export function isValidTaskDescription(description: string): boolean {
  if (typeof description !== 'string') {
    return false
  }
  const trimmed = description.trim()
  return (
    trimmed.length >= MIN_DESCRIPTION_LENGTH &&
    trimmed.length <= MAX_DESCRIPTION_LENGTH
  )
}

/** 验证 ID 是否为非空字符串 */
export function isValidId(id: string): boolean {
  return typeof id === 'string' && id.trim().length > 0
}
