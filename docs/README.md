# 文档导航

> RiskAgent-FrontEnd 项目文档体系总览。本目录是所有项目文档的入口。

## 文档体系总览

```
docs/
├── README.md                          # 文档导航入口（本文件）
├── PRD.md                             # 产品需求总纲
├── phases/                            # 分阶段规划
│   └── phase-0-dual-app-foundation.md # 双应用最小闭环阶段
│   └── phase-1-light-theme-and-memory-observability.md # 浅色工作台与记忆可观测性
├── architecture/                      # 架构文档
│   ├── overview.md                    # 系统架构概览
│   ├── frontend.md                    # 前端架构详解
│   ├── data-model.md                  # 数据模型定义
│   └── rest-bff-contract.md           # 前后端 REST BFF 接口契约
├── guides/                            # 开发指南
│   ├── setup.md                       # 环境搭建指南
│   ├── development.md                 # 开发流程指南
│   └── deployment.md                  # 部署指南
├── testing/                           # 测试与联调说明
│   └── rest-bff-integration.md        # FrontEnd 到 BackEnd 的真实 REST 联调测试
├── standards/                         # 开发规范
│   ├── coding-conventions.md          # 编码规范
│   └── testing.md                     # 测试规范
└── decisions/                         # 架构决策记录（ADR）
    ├── 0001-tech-stack-selection.md   # 技术栈选型决策
    ├── 0002-backend-frontend-architecture.md  # BackEnd 前端架构决策
    ├── 0003-volcengine-deployment.md  # ADR: 火山引擎部署决策
    └── 0004-dual-app-repo-and-k8s-deployment.md  # ADR: 双应用仓库与 K8s 部署决策
```

## 文档索引

### 产品与规划

| 文档 | 路径 | 说明 |
|------|------|------|
| 产品需求总纲 | [PRD.md](PRD.md) | 项目目标、功能需求、非功能需求、发布准入标准 |
| Phase 0 双应用闭环 | [phases/phase-0-dual-app-foundation.md](phases/phase-0-dual-app-foundation.md) | 当前阶段的开发目标、范围、验收标准和交付物 |
| Phase 1 浅色工作台与记忆可观测性 | [phases/phase-1-light-theme-and-memory-observability.md](phases/phase-1-light-theme-and-memory-observability.md) | 定义浅色主题改版和实时记忆展示的阶段目标、范围和验收标准 |

### 架构文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 架构概览 | [architecture/overview.md](architecture/overview.md) | 系统总体架构设计、设计原则、核心概念说明 |
| 前端架构 | [architecture/frontend.md](architecture/frontend.md) | 目录结构、状态管理、组件层级、通信层、路由设计 |
| 数据模型 | [architecture/data-model.md](architecture/data-model.md) | TypeScript 核心类型定义、枚举、Store 状态结构 |
| REST BFF 契约 | [architecture/rest-bff-contract.md](architecture/rest-bff-contract.md) | 前端调用后端最小闭环接口的请求响应协议 |

### 开发指南

| 文档 | 路径 | 说明 |
|------|------|------|
| 环境搭建 | [guides/setup.md](guides/setup.md) | 前置要求、安装步骤、开发命令、编辑器配置、常见问题 |
| 开发流程 | [guides/development.md](guides/development.md) | 开发工作流、代码组织、调试技巧、组件模板、状态管理实践 |
| 部署指南 | [guides/deployment.md](guides/deployment.md) | 架构总览、火山引擎 ECS 部署、nginx 配置、成本估算、升级路径 |

### 测试与联调

| 文档 | 路径 | 说明 |
|------|------|------|
| REST BFF 联调测试 | [testing/rest-bff-integration.md](testing/rest-bff-integration.md) | FrontEnd 通过本地 K8s 生产等价链路联调 BackEnd REST BFF 的执行方式和验收标准 |

### 开发规范

| 文档 | 路径 | 说明 |
|------|------|------|
| 编码规范 | [standards/coding-conventions.md](standards/coding-conventions.md) | 命名、TypeScript、React、CSS、目录组织、Git 提交规范 |
| 测试规范 | [standards/testing.md](standards/testing.md) | 测试策略、工具选型、文件组织、覆盖率目标、编写示例 |

### 架构决策记录（ADR）

| 文档 | 路径 | 说明 |
|------|------|------|
| 技术栈选型 | [decisions/0001-tech-stack-selection.md](decisions/0001-tech-stack-selection.md) | React 19 + Vite 8 + TS 6 + Zustand + React Flow + SSE 的选型理由 |
| BackEnd 架构 | [decisions/0002-backend-frontend-architecture.md](decisions/0002-backend-frontend-architecture.md) | Zustand + React Flow + SSE + XState 的架构决策理由 |
| 火山引擎部署 | [decisions/0003-volcengine-deployment.md](decisions/0003-volcengine-deployment.md) | 早期单机 ECS MVP 路线的历史决策 |
| 双应用仓库与 K8s 部署 | [decisions/0004-dual-app-repo-and-k8s-deployment.md](decisions/0004-dual-app-repo-and-k8s-deployment.md) | 当前默认实施路径, 即 FrontEnd 与 BackEnd 保持双应用边界并统一在 K8s 闭环交付 |

### 根目录文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 项目说明 | [../README.md](../README.md) | 项目门面文档，面向新用户 |
| AI 协作 | [../AGENTS.md](../AGENTS.md) | AI 编程助手协作说明 |
| 贡献指南 | [../CONTRIBUTING.md](../CONTRIBUTING.md) | 参与贡献的流程和规范 |
| 更新日志 | [../CHANGELOG.md](../CHANGELOG.md) | 版本更新记录 |

## 文档编写规范

### Markdown 格式

- 使用 ATX 风格标题（`#`、`##`、`###`），标题前后保留空行
- 列表项使用 `-`（无序列表）或 `1.`（有序列表）
- 代码块使用三反引号并标注语言（```bash、```typescript、```mermaid 等）
- 表格使用标准 Markdown 表格语法，表头和分隔行必须对齐
- 链接使用相对路径（文档间互链），外部链接使用完整 URL

### Mermaid 图表

- 图表使用 ` ```mermaid ` 代码块包裹
- 节点文字简洁明了，使用中文
- 不使用样式定义（`style`、`classDef`）
- 使用 `graph TB`（从上到下）或 `graph LR`（从左到右）方向
- subgraph 用于模块分组，分组名使用中文

### 命名规范

- 文档文件名使用 kebab-case（如 `coding-conventions.md`）
- ADR 文件使用 `NNNN-description.md` 格式（四位序号 + 描述）
- 目录名使用 kebab-case 或单数英文（如 `architecture`、`guides`）

### 文档更新原则

- 新增功能时同步更新相关架构文档和 CHANGELOG
- 重大架构变更需新增 ADR 记录
- 需求范围、开发目标和发布标准变化时同步更新 `PRD.md` 与对应 `phases/` 文档
- 文档内容保持具体可操作，避免空泛描述
- 每个文档控制在 100-300 行以内

## 文档使用顺序

1. 先在 `PRD.md` 中确认目标、范围和需求编号
2. 再在 `decisions/` 中记录关键架构取舍和约束
3. 然后在 `phases/` 中拆解当前阶段的开发目标、验收标准和交付物
4. 编码时同步更新 `architecture/` 与 `guides/`
5. 验收完成后回写 Phase 状态和 README 对外口径
