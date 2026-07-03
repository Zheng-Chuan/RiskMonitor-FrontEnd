# 更新日志

本项目所有重要变更均记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本管理遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## 变更类型说明

- `新增` — 新增的功能
- `变更` — 对现有功能的修改
- `弃用` — 即将移除的功能
- `移除` — 本版本已移除的功能
- `修复` — Bug 修复
- `安全` — 安全相关的修复

---

## [Unreleased]

### 新增

- 规划 Zustand 状态管理架构（按领域拆分 Store）
- 规划 React Flow 专家团可视化画布
- 规划 XState 专家工作流状态机建模
- 规划 SSE 通信层封装
- 规划 React Router 路由系统
- 新增部署指南（[docs/guides/deployment.md](docs/guides/deployment.md)）— 火山引擎 ECS 部署
- 新增 ADR-0003 火山引擎部署决策（[docs/decisions/0003-volcengine-deployment.md](docs/decisions/0003-volcengine-deployment.md)）

## [0.1.0] - 2026-07-03

### 新增

- 初始化项目脚手架（React 19 + TypeScript 6 + Vite 8 + Oxlint）
- 配置 Vite 开发服务器与构建管线
- 配置 Oxlint 代码检查规则（react、typescript、oxc 插件）
- 创建项目完整文档体系：
  - [README.md](README.md) — 项目门面文档
  - [AGENTS.md](AGENTS.md) — AI 编程助手协作说明
  - [CONTRIBUTING.md](CONTRIBUTING.md) — 贡献指南
  - [docs/README.md](docs/README.md) — 文档导航入口
  - [docs/architecture/overview.md](docs/architecture/overview.md) — 架构概览
  - [docs/architecture/frontend.md](docs/architecture/frontend.md) — 前端架构详解
  - [docs/architecture/data-model.md](docs/architecture/data-model.md) — 数据模型定义
  - [docs/guides/setup.md](docs/guides/setup.md) — 环境搭建指南
  - [docs/guides/development.md](docs/guides/development.md) — 开发流程指南
  - [docs/standards/coding-conventions.md](docs/standards/coding-conventions.md) — 编码规范
  - [docs/standards/testing.md](docs/standards/testing.md) — 测试规范
  - [docs/decisions/0001-tech-stack-selection.md](docs/decisions/0001-tech-stack-selection.md) — ADR: 技术栈选型
  - [docs/decisions/0002-multiagent-frontend-architecture.md](docs/decisions/0002-multiagent-frontend-architecture.md) — ADR: MultiAgent 前端架构
- 定义 MultiAgent 专家团角色模型（Lead、Researcher、Engineer、QA、Reviewer、UI Operator）
- 定义任务状态枚举（pending、in_progress、completed、failed、cancelled）
- 定义 SSE 消息类型规范（agent_status、token_stream、task_update、artifact、error）
- 定义核心数据类型（Agent、Task、Message、Artifact）

---

<!-- 链接区域 -->

[Unreleased]: https://github.com/zhengchuan/RiskMonitor-FrontEnd/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/zhengchuan/RiskMonitor-FrontEnd/releases/tag/v0.1.0
