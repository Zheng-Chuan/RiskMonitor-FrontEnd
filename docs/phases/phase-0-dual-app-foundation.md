# Phase 0: 双应用最小闭环基础建设

## 状态

已规划, 待执行

## 核心目标

在不合并前后端代码项目的前提下, 让 RiskAgent-FrontEnd 与 RiskAgent-BackEnd 跑通最小 demo 闭环, 并具备 K8s 部署基础.

## 时间盒与优先级

- 时间: 1 个迭代
- 优先级: 高

## 工作范围

### In Scope

- 明确 FrontEnd 与 BackEnd 保持双应用边界
- 为前端补齐需求总纲和阶段文档位
- 定义前端最小页面范围和后端 REST BFF 依赖
- 规划前端独立容器化和 K8s 部署路径
- 统一文档口径为轮询 MVP

### Out of Scope

- React Flow 专家画布
- SSE 实时推送
- 复杂用户权限和登录体系
- 多副本高可用和自动扩缩容

## 开发目标

- Goal 1: 让 FrontEnd 有清晰的 PRD, ADR 和阶段文档入口
- Goal 2: 确定最小 demo 的页面边界, 接口边界和部署边界
- Goal 3: 为后续编码提供可直接落地的验收口径

## 详细 Checkpoint

- [x] 补齐 `docs/PRD.md`
- [x] 新增双应用仓库与 K8s 部署 ADR
- [x] 明确前端最小功能集合和接口依赖
- [x] 明确前端独立 Deployment 和统一 Ingress 路由方案
- [x] 将当前阶段验收标准沉淀为可执行清单

## 验收标准

- 文档入口能说明 FrontEnd 当前采用的产品总纲, ADR 和 Phase 结构
- 团队对 `双应用同仓库` 达成统一口径
- 团队对 `轮询 MVP` 达成统一口径
- 团队对 `前端独立部署 + Ingress 汇总暴露` 达成统一口径
- 文档中能直接找到本阶段功能范围, 风险和交付物

## 交付物清单

- 文档: `docs/PRD.md`
- 文档: `docs/decisions/0004-dual-app-repo-and-k8s-deployment.md`
- 文档: `docs/phases/phase-0-dual-app-foundation.md`
- 导航: `docs/README.md`

## 依赖关系

- 后端需要补齐 `POST /api/tasks` `GET /api/tasks/{task_id}` `GET /api/agents`
- 前端需要基于统一 REST 协议实现任务提交和轮询
- K8s 需要补齐前端容器镜像和 Deployment Service Ingress 清单

## 风险提醒

- 前端现有架构文档对 SSE 和画布描述较重, 需要和轮询 MVP 口径继续收敛
- 后端 REST BFF 尚未落地, 编码阶段要先打通协议层
- 前端 K8s 文档和部署物料目前还未落地, 不能直接宣称已支持

## 相关文档

- PRD: [../PRD.md](../PRD.md)
- ADR: [../decisions/0004-dual-app-repo-and-k8s-deployment.md](../decisions/0004-dual-app-repo-and-k8s-deployment.md)
- 部署指南: [../guides/deployment.md](../guides/deployment.md)
