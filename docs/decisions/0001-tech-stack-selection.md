# ADR-0001: 技术栈选型

| 字段 | 值 |
|------|-----|
| 编号 | 0001 |
| 标题 | 技术栈选型决策 |
| 状态 | Accepted |
| 日期 | 2026-07-03 |
| 决策者 | 项目团队 |

## 上下文

RiskMonitor-FrontEnd 是一个纯前端 MultiAgent 多智能体协作平台，需要支持以下复杂交互场景：

- 多个智能体角色的实时状态同步与可视化
- 流式对话（逐 token 渲染）
- 可拖拽的专家团画布（节点连线、状态更新）
- 任务依赖的 DAG 管理与展示
- 大量实时数据的性能要求

项目不包含后端，所有数据通过 SSE 和 HTTP 从外部 AI 服务获取。因此技术选型需满足：

1. 高性能的实时渲染能力
2. 完善的类型系统保障数据模型安全
3. 极速的开发体验（HMR、构建速度）
4. 丰富的可视化生态
5. 轻量但足够强大的状态管理

## 决策

选择以下技术栈：

| 技术 | 版本 | 角色 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 6 | 类型系统 |
| Vite | 8 | 构建工具 |
| Oxlint | 1.71+ | 代码检查 |
| Zustand | 5（规划中） | 状态管理 |
| React Flow | 12（规划中） | 画布可视化 |
| XState | 5（规划中） | 状态机 |
| React Router | 7（规划中） | 路由 |
| 原生 SSE + Fetch | - | 通信 |

## 理由

### React 19

- 最成熟的组件化 UI 框架，生态丰富
- 19 版本带来并发渲染改进、Server Components 基础支持
- React Flow、Zustand 等核心依赖均以 React 为基础
- 团队熟悉度高，招聘和维护成本低

### TypeScript 6

- 静态类型检查在 MultiAgent 场景下至关重要（多角色、多消息类型）
- 6 版本带来更好的类型推断和性能
- 与 Vite、Oxlint 深度集成

### Vite 8

- 基于 ESM 的极速 HMR，开发体验优秀
- 原生支持 TypeScript、React 插件
- 构建产物基于 Rollup，生产环境性能可靠
- 配置简单，开箱即用

### Oxlint

- 基于 Oxc 的高性能 Linter，速度远超 ESLint
- 原生支持 TypeScript 和 React 规则
- 与 Vite 生态深度集成

### Zustand

- 轻量（~1KB），API 简洁
- 无 Provider 包裹，避免组件树嵌套
- 细粒度选择器实现精准重渲染
- 按领域拆分 Store 天然适合 MultiAgent 场景
- 相比 Redux 更简洁，相比 Context 更高效

### React Flow

- 专业级节点画布库，支持拖拽、缩放、连线
- 天然适合专家团可视化场景
- 节点和边完全可定制
- 性能优化好，支持大量节点

## 后果

### 优势

- 技术栈各组件之间兼容性好，均为主流方案
- 开发体验优秀（Vite HMR + Oxlint 速度 + TypeScript 类型安全）
- Zustand + React Flow 组合在 MultiAgent 可视化场景下无替代方案
- 社区活跃，文档完善，问题排查成本低

### 风险

- React 19 和 TypeScript 6 为较新版本，部分第三方库可能存在兼容性问题
- Zustand 缺乏 Redux 的中间件生态（如 saga），复杂异步流需自行管理
- React Flow 在超大规模节点（1000+）时可能需要额外性能优化
- XState 有一定学习曲线，团队需投入时间学习状态机概念

### 缓解措施

- 新版本兼容性问题通过锁定依赖版本和定期升级缓解
- 异步流通过自定义 Hooks + SSE 事件驱动管理，替代 Redux 中间件
- 大规模节点采用虚拟化和分页加载策略
- XState 仅用于专家工作流状态建模，不强制全局使用

## 相关 ADR

- [ADR-0002: MultiAgent 前端架构](0002-multiagent-frontend-architecture.md) — 基于本技术栈的架构设计决策
