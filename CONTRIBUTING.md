# 贡献指南

感谢您关注 RiskMonitor-FrontEnd 项目！本文档将指导您如何参与项目贡献。

## 如何参与贡献

1. Fork 本仓库到您的 GitHub 账号
2. 基于最新的 `develop` 分支创建您的特性分支
3. 按照编码规范完成开发
4. 提交 Pull Request 到 `develop` 分支
5. 通过代码审查后合并

## 开发环境搭建

### 前置要求

- **Node.js** >= 20.0.0（推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理版本）
- **npm** >= 10.0.0（或 pnpm >= 9.0.0）
- **Git** >= 2.40.0
- **VSCode**（推荐）+ 以下插件：
  - ESLint / Oxlint
  - Prettier
  - TypeScript Vue Plugin (Volar)
  - Tailwind CSS IntelliSense（如使用）

### 搭建步骤

```bash
# 1. 克隆仓库
git clone <your-fork-url>
cd RiskMonitor-FrontEnd

# 2. 添加上游仓库
git remote add upstream https://github.com/zhengchuan/RiskMonitor-FrontEnd.git

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev

# 5. 验证环境（以下命令均应无报错）
npm run lint
npm run build
```

详细环境搭建请参考 [环境搭建指南](docs/guides/setup.md)。

## 分支策略

本项目采用 Git Flow 简化版分支策略：

| 分支 | 用途 | 命名规则 | 保护规则 |
|------|------|----------|----------|
| `main` | 生产发布分支 | `main` | 禁止直接推送，仅通过 PR 合并 |
| `develop` | 开发集成分支 | `develop` | 禁止直接推送，仅通过 PR 合并 |
| `feature/*` | 功能开发分支 | `feature/<feature-name>` | 从 `develop` 拉出，合并回 `develop` |
| `fix/*` | Bug 修复分支 | `fix/<bug-description>` | 从 `develop` 拉出，合并回 `develop` |
| `hotfix/*` | 紧急修复分支 | `hotfix/<issue-id>` | 从 `main` 拉出，合并回 `main` 和 `develop` |
| `release/*` | 发布准备分支 | `release/<version>` | 从 `develop` 拉出，合并回 `main` 和 `develop` |

### 分支命名示例

```bash
# 功能分支
git checkout -b feature/multiagent-canvas develop

# Bug 修复分支
git checkout -b fix/sse-reconnect-error develop

# 紧急修复
git checkout -b hotfix/issue-42 main
```

## 提交规范

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型（type）

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(canvas): 新增专家团画布拖拽功能` |
| `fix` | Bug 修复 | `fix(sse): 修复连接断开后未自动重连` |
| `docs` | 文档变更 | `docs: 更新 README 安装步骤` |
| `style` | 代码格式（不影响功能） | `style: 统一缩进为 2 空格` |
| `refactor` | 重构（不新增功能、不修复 Bug） | `refactor(store): 拆分任务 Store` |
| `perf` | 性能优化 | `perf(canvas): 优化大节点渲染性能` |
| `test` | 测试相关 | `test(hooks): 新增 useAgentStatus 测试` |
| `chore` | 构建/工具/依赖变更 | `chore(deps): 升级 Vite 至 8.1.1` |
| `ci` | CI/CD 变更 | `ci: 配置 GitHub Actions 工作流` |
| `revert` | 回退提交 | `revert: 回退 feat(canvas) 提交` |

### 作用域（scope）

常用作用域：`canvas`、`chat`、`task`、`store`、`api`、`sse`、`types`、`utils`、`deps`

### 提交示例

```bash
git commit -m "feat(canvas): 新增专家团画布节点连线功能"
git commit -m "fix(sse): 修复流式消息丢失问题

断线重连后未恢复 SSE 事件流，增加事件序列号校验和重放机制。"
```

## 代码审查流程

1. **提交 PR** — PR 标题遵循 Conventional Commits 格式，描述包含变更说明和测试方式
2. **自动化检查** — CI 自动运行 `lint` 和 `build`，全部通过后进入人工审查
3. **人工审查** — 至少 1 位 Reviewer 审查通过：
   - 代码是否符合架构约束和编码规范
   - 是否有潜在的性能或安全问题
   - 是否有足够的测试覆盖
   - 文档是否同步更新
4. **合并** — 审查通过后使用 Squash Merge 合并到目标分支

## Issue 和 PR 规范

### Issue 模板

- **Bug 报告**：包含复现步骤、期望行为、实际行为、环境信息
- **功能建议**：包含背景说明、功能描述、替代方案、附加信息

### PR 模板

```markdown
## 变更说明

<!-- 简要描述本次 PR 做了什么以及为什么 -->

## 变更类型

- [ ] 新功能（feat）
- [ ] Bug 修复（fix）
- [ ] 重构（refactor）
- [ ] 文档（docs）
- [ ] 其他

## 测试方式

<!-- 描述如何验证本次变更 -->

## 检查清单

- [ ] 代码通过 `npm run lint`
- [ ] 构建通过 `npm run build`
- [ ] 相关文档已更新
- [ ] 无 TODO/FIXME 残留
```
