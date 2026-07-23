# RiskMonitor-FrontEnd PRD

## 1. 文档目标

本文档是 RiskMonitor-FrontEnd 的产品需求总纲. 它定义当前阶段的目标边界, 功能需求, 非功能需求和发布准入标准.

- 架构设计: [architecture/overview.md](./architecture/overview.md)
- 技术决策: [decisions/](./decisions/)
- 分阶段规划: [phases/](./phases/)
- 部署指南: [guides/deployment.md](./guides/deployment.md)

## 2. 项目定位

把 RiskMonitor-FrontEnd 从"多智能体前端骨架和文档原型"升级为"能与 RiskMonitor-MultiAgent 形成最小业务闭环的前端应用".

当前阶段坚持两个约束:

- FrontEnd 与 MultiAgent 保持双应用边界, 不合并为单一代码项目
- FrontEnd 在同一仓库内独立演进, 但和后端共享一套联调与部署闭环

### 2.1 成功标准

- 前端能提交一个真实任务并展示执行状态和最终结果
- 前端能展示后端返回的智能体状态列表
- 前端在本地和云端都通过统一的 `/api/*` 协议访问后端
- 前端构建产物可独立部署到 K8s, 不依赖后端模板渲染
- 文档中的目标, 架构和部署口径保持一致

### 2.2 非目标

- 本阶段不实现 React Flow 画布
- 本阶段不实现 SSE 实时流式协议
- 本阶段不实现复杂权限系统
- 本阶段不追求多环境高可用和自动扩缩容

## 3. 核心用户与场景

### 3.1 核心用户

- 风控平台研发
- 风控运营人员
- 项目演示和验收人员

### 3.2 核心场景

- 提交一条风控查询任务并查看执行进度
- 查看当前智能体角色的状态快照
- 在云端 K8s 环境访问一个可演示的最小前端页面

## 4. 架构约束

- 系统保持独立前端应用形态, 不把 React 构建链并入 Python 服务
- 前端只通过面向浏览器的 REST BFF 调用后端, 不直接实现 MCP 客户端
- 前端和后端分别作为独立 Deployment 运行, 由同一个 Ingress 对外暴露
- MVP 先采用轮询协议, 后续再评估 SSE 升级

## 5. 核心里程碑

| 阶段 | 目标 | 状态 | 详情 |
|------|------|------|------|
| Phase 0 | 双应用最小闭环基础建设 | 规划中 | [phase-0-dual-app-foundation.md](./phases/phase-0-dual-app-foundation.md) |

## 6. 关键技术决策

| 决策 | 状态 | 文档 |
|------|------|------|
| React 19 + Vite 8 + TypeScript 6 技术栈 | Accepted | [0001](./decisions/0001-tech-stack-selection.md) |
| Zustand + React Flow + SSE + XState 前端架构 | Accepted | [0002](./decisions/0002-multiagent-frontend-architecture.md) |
| 火山引擎 ECS 一体化部署 | Accepted | [0003](./decisions/0003-volcengine-deployment.md) |
| 双应用仓库与 K8s 部署策略 | Accepted | [0004](./decisions/0004-dual-app-repo-and-k8s-deployment.md) |

## 7. 功能需求清单

| 编号 | 需求 | 说明 |
|------|------|------|
| FR-1 | 前端必须支持任务提交 | 通过 `POST /api/tasks` 提交任务描述并拿到 `task_id` |
| FR-2 | 前端必须支持任务轮询 | 通过 `GET /api/tasks/{task_id}` 展示 `pending/running/completed/failed` 状态 |
| FR-3 | 前端必须支持智能体状态展示 | 通过 `GET /api/agents` 展示角色名称, 状态和当前任务 |
| FR-4 | 前端必须支持最小结果展示 | 在页面中展示最终输出, 错误信息和最近更新时间 |
| FR-5 | 前端必须保持双应用边界 | 不直接耦合 Python 运行时, 不内嵌后端模板 |
| FR-6 | 前端必须支持 K8s 独立部署 | 构建产物可单独容器化并作为独立服务发布 |

## 8. 非功能需求

- NFR-1: `npm run build` 必须稳定通过
- NFR-2: `npm run lint` 必须稳定通过
- NFR-3: 核心 Store 和 API 逻辑需要补充测试
- NFR-4: 前端页面需要在后端暂时不可用时提供明确错误提示
- NFR-5: 文档变更必须与实现同 PR 演进

## 9. 风险与取舍

### 主要风险

- 当前前端架构文档以 SSE 和画布为中心, 与 MVP 轮询方案存在口径差异
- 当前后端还没有完整的前端 REST BFF, 前端无法立即接通真实链路
- K8s 路线会引入 Ingress, 镜像仓库和环境变量管理复杂度

### 设计取舍

- 优先保留双应用边界, 不为了短期 demo 合并代码项目
- 优先完成可演示闭环, 不抢先实现画布和实时流
- 优先统一文档口径, 再推进编码和部署

## 10. 发布准入标准

以下条件同时满足, 才允许把 FrontEnd 视为最小 demo 可交付状态:

- 页面可提交任务并展示任务状态变化
- 页面可展示智能体状态列表和最终结果
- 本地联调环境能通过 `/api/*` 正常访问后端
- K8s 环境中前端与后端都能通过 Ingress 访问
- README, PRD, ADR 和 Phase 文档对当前交付口径一致

## 11. 当前阶段开发目标

- 建立 FrontEnd 自有的需求总纲与阶段规划文档位
- 明确双应用仓库与 K8s 闭环为当前默认实施路径
- 约束 MVP 范围为 `表单提交 + 任务轮询 + 智能体状态 + 最终结果`

## 12. 相关文档

- [文档导航](./README.md)
- [架构概览](./architecture/overview.md)
- [开发流程](./guides/development.md)
- [部署指南](./guides/deployment.md)
