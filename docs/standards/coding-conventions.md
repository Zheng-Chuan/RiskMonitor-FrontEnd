# 编码规范

> RiskAgent-FrontEnd 项目的代码风格与编码规范。所有贡献者须遵循本规范。

## 命名规范

### 变量与类型命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `AgentNode`、`TaskCard` |
| 函数 | camelCase | `fetchTasks`、`handleSubmit` |
| 变量 | camelCase | `agentId`、`isActive` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RECONNECT`、`API_BASE_URL` |
| 接口 | PascalCase | `Agent`、`TaskStatus` |
| 类型别名 | PascalCase | `AgentRole`、`SSEMessageType` |
| 枚举值 | 小写字符串 | `'lead'`、`'in_progress'` |
| 自定义 Hook | use 前缀 + camelCase | `useAgentStatus`、`useSSE` |
| 文件名 | kebab-case | `agent-node.tsx`、`chat-store.ts` |
| 目录名 | kebab-case | `agent-node/`、`chat-panel/` |
| CSS Module 类名 | camelCase | `.agentNode`、`.isActive` |

## TypeScript 规范

### 类型声明

- **显式声明**：所有函数参数和返回值必须显式标注类型
- **接口优先**：对象形状使用 `interface`，联合/交叉类型使用 `type`
- **禁止 any**：如需绕过类型检查使用 `unknown` 并添加注释说明

```typescript
// ✅ 正确
interface AgentProps {
  agentId: string
  onSelect?: (id: string) => void
}

function fetchAgent(id: string): Promise<Agent> {
  return api.get(`/agents/${id}`)
}

// ❌ 错误
function fetchAgent(id: any): any {
  return api.get(`/agents/${id}`)
}
```

### 枚举使用

优先使用字符串联合类型，需要运行时枚举时使用 `as const` 对象：

```typescript
// ✅ 推荐：字符串联合类型
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

// ✅ 需要运行时值映射时
const TASK_STATUS_LABELS = {
  pending: '待处理',
  in_progress: '执行中',
  completed: '已完成',
  failed: '失败',
  cancelled: '已取消',
} as const

// ❌ 不推荐：数字枚举
enum TaskStatus { Pending, InProgress, Completed }
```

### 导入导出

- 使用 ES Module 标准 `import`/`export`
- 类型导入使用 `import type`
- 组件使用具名导出（named export）

```typescript
// ✅ 正确
import { useState } from 'react'
import type { Agent, Task } from '../types'

export function AgentNode() { /* ... */ }

// ❌ 错误
const AgentNode = () => { /* ... */ }
export default AgentNode
```

## React 规范

### 函数组件

- 统一使用函数组件，不使用 class 组件
- Props 必须定义 interface
- 组件名与文件名一致（PascalCase 组件名，kebab-case 文件名）

### Hooks 规则

- Hooks 只在顶层调用，不在条件、循环、嵌套函数中调用
- 自定义 Hook 必须以 `use` 开头
- 依赖数组必须完整，禁止省略

### 组件拆分原则

- 单一职责：一个组件只做一件事
- 超过 200 行的组件考虑拆分
- 可复用逻辑提取为自定义 Hook
- 重复 3 次以上的 UI 模式提取为组件

```typescript
// ✅ 组件拆分示例
function WorkspacePage() {
  return (
    <WorkspaceLayout>
      <ChatPanel />
      <ExpertCanvas />
      <TaskList />
    </WorkspaceLayout>
  )
}
```

## CSS 规范

### CSS Module

- 使用 CSS Module（`.module.css`）实现样式隔离
- 类名使用 camelCase
- 不使用内联样式（`style={{}}`），除非动态计算的值

```css
/* agent-node.module.css */
.node {
  display: flex;
  padding: 12px;
  border-radius: 8px;
}

.isActive {
  border-color: #3b82f6;
}
```

### 响应式设计

- 使用 CSS 媒体查询实现响应式
- 断点：移动端 < 768px、平板 768-1024px、桌面 > 1024px
- 优先使用 Flexbox 和 Grid 布局

## 目录和文件组织规范

### 目录结构规则

```
src/
├── components/
│   └── base/
│       └── button/
│           ├── button.tsx           # 组件实现
│           ├── button.module.css    # 组件样式
│           ├── button.test.tsx      # 组件测试
│           └── index.ts             # 导出汇总
├── hooks/
│   ├── use-sse.ts
│   └── use-sse.test.ts
├── store/
│   ├── chat-store.ts
│   └── chat-store.test.ts
└── types/
    ├── agent.ts
    └── index.ts
```

### 文件组织规则

- 每个组件一个独立目录
- 测试文件与源文件同目录，命名为 `*.test.ts(x)`
- 类型文件集中在 `types/` 目录
- 每个 `index.ts` 作为模块导出入口
- 单文件不超过 300 行，超过则拆分

## Git 提交规范

### Conventional Commits 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型列表

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具/依赖 |
| `ci` | CI/CD 变更 |
| `revert` | 回退提交 |

### 提交规则

- subject 使用中文，不超过 50 字符
- body 每行不超过 72 字符
- 一个提交只做一件事
- 禁止提交 `console.log`、调试代码和注释掉的代码

```bash
# ✅ 正确
git commit -m "feat(canvas): 新增专家团画布拖拽功能"

# ❌ 错误
git commit -m "update"
git commit -m "fix bug and add feature and update docs"
```

测试规范详见 [测试规范](testing.md)，开发流程详见 [开发流程指南](../guides/development.md)。
