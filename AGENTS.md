# AGENTS.md

> 本文件为 AI 编程助手提供项目协作说明，确保 AI 在参与本项目开发时遵循统一的规范和流程。

## 项目概览

RiskAgent-FrontEnd 是一个纯前端 BackEnd 多智能体协作平台，技术栈为 React 19 + TypeScript 6 + Vite 8 + Oxlint。项目不包含任何后端功能，通过 SSE 与外部 AI 服务通信，实现类似 Qoder 专家团的多智能体协作体验。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装项目依赖 |
| `npm run dev` | 启动开发服务器（HMR，默认端口 5173） |
| `npm run build` | 类型检查 + 生产构建（输出至 `dist/`） |
| `npm run lint` | 运行 Oxlint 代码检查 |
| `npm run preview` | 预览生产构建结果 |

## 架构约束

### 目录分层规则

- `src/components/base/` — 基础组件，无业务逻辑，可跨项目复用
- `src/components/layout/` — 布局组件，负责页面结构组织
- `src/components/business/` — 业务组件，包含特定业务逻辑
- `src/pages/` — 页面级组件，对应路由
- `src/hooks/` — 自定义 Hooks，必须以 `use` 开头
- `src/store/` — Zustand Store 定义，按领域拆分
- `src/api/` — 通信层，SSE 客户端与 HTTP 请求封装
- `src/types/` — TypeScript 类型定义，按领域组织
- `src/utils/` — 纯函数工具，无副作用

### 禁止事项

- **禁止**在 `components/base/` 中引入业务逻辑或全局状态
- **禁止**在 `utils/` 中引入副作用或外部依赖
- **禁止**在组件中直接调用 `fetch` 或 `EventSource`，必须通过 `src/api/` 封装层
- **禁止**使用 `any` 类型，如确需绕过类型检查应使用 `unknown` 并添加注释说明
- **禁止**在 `store/` 中编写 UI 逻辑，Store 只负责状态管理
- **禁止**跨领域引用 Store（如对话 Store 不应直接操作画布 Store）

## 代码风格规范要点

- **命名**：组件 PascalCase，函数/变量 camelCase，常量 UPPER_SNAKE_CASE，文件 kebab-case
- **类型**：接口优先于类型别名（`interface` > `type`），枚举使用 `const enum` 或字符串联合类型
- **导入**：使用 ES Module 标准导入，禁止 `require()`
- **导出**：组件使用具名导出（named export），避免默认导出
- **React**：函数组件 + Hooks，严格遵守 Hooks 规则，组件拆分遵循单一职责原则
- **CSS**：使用 CSS Module（`.module.css`），类名 camelCase

## BackEnd 专家团角色定义

本项目模拟以下多智能体角色，前端需为每个角色提供独立的状态空间和 UI 呈现：

| 角色 | 标识 | 职责 | 前端呈现 |
|------|------|------|----------|
| Lead Agent | `lead` | 统一调度、任务分解、专家分配 | 画布中心节点，任务分配视图 |
| 调研员 | `researcher` | 需求调研、技术选型、信息收集 | 调研报告面板，产物流水线 |
| 全栈工程师 | `engineer` | 代码编写、功能实现、架构搭建 | 代码编辑视图，变更预览 |
| QA | `qa` | 测试编写、质量验证、Bug 发现 | 测试结果面板，覆盖率视图 |
| 代码审查员 | `reviewer` | 代码审查、规范检查、安全审计 | 审查意见面板，Diff 视图 |
| UI 操作者 | `ui_operator` | 界面操作、交互验证、视觉检查 | 操作录制回放，截图展示 |

## 任务完成标准

每个开发任务须满足以下条件方可标记为完成：

1. **代码实现** — 功能完整实现，无 TODO/FIXME 残留
2. **类型安全** — `npm run build` 通过，无 TypeScript 编译错误
3. **代码规范** — `npm run lint` 通过，无 Oxlint 报错
4. **组件拆分** — 遵循目录分层规则，组件职责清晰
5. **状态隔离** — Store 按领域组织，不越界操作
6. **API 封装** — 所有网络请求通过 `src/api/` 层，不直接在组件中调用
7. **文档同步** — 如涉及架构变更或新增类型，同步更新 `docs/` 下对应文档
