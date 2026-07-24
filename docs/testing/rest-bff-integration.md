# REST BFF 联调测试

## 目标

这份文档说明 FrontEnd 如何以生产等价方式联调 MultiAgent 的 REST BFF 服务.

当前口径如下:

- 不使用 mock
- 测试必须真实调用 `RiskMonitor-MultiAgent`
- 页面联调必须跑在本地 K8s
- FrontEnd 和 MultiAgent 都必须运行在 Pod 中
- MySQL Redis Chroma 必须作为真实中间件存在
- 后续联调以自动化测试用例作为主验证手段

## 测试分层

### 基础单测

验证前端自身的数据映射和状态管理:

- `tests/unit/riskmonitor-api.test.ts`
- `tests/unit/workspace-presenters.test.ts`
- `tests/unit/stores.test.ts`

运行命令:

```bash
npm run test:unit
```

### REST BFF 真实接口联调

验证 FrontEnd 真实调用 MultiAgent 的以下接口:

- `POST /api/tasks`
- `GET /api/tasks/{task_id}`
- `GET /api/agents`

测试文件:

- `tests/integration/rest-bff.real.test.ts`

如果已经有一个真实 REST BFF 地址:

```bash
VITE_API_BASE_URL=http://127.0.0.1:18080 npm run test:integration:rest
```

这个分层主要用于接口契约快速回归. 最终验收仍以 K8s 页面联调为准.

### 工作台页面 K8s 真实联调测试

验证 FrontEnd 在真实浏览器环境中通过前端 Pod 访问后端 Pod 的完整页面闭环:

- 浏览器只访问 FrontEnd Service
- FrontEnd Pod 内的 Nginx 将 `/api` 代理到 `mcp-server` Service
- MultiAgent Pod 真实连接 MySQL Redis Chroma
- Playwright 只断言真实页面 DOM 和真实后端返回

测试文件:

- `tests/e2e/workspace.real.spec.ts`

运行命令:

```bash
npm run test:e2e:workspace:k8s
```

执行步骤:

1. 构建前端和后端本地镜像
2. 用 Helm 在本地 K8s 中部署 MultiAgent MySQL Redis Chroma FrontEnd
3. 等待 StatefulSet 和 Deployment 就绪
4. 通过 `kubectl port-forward` 暴露 FrontEnd Service
5. 让 Playwright 直连这个前端入口执行 4 个场景

页面场景定义:

- 场景 1. 空输入提交失败路径. 验证前端在真实页面中阻止空任务提交并展示错误提示
- 场景 2. 基础 happy path. 验证提交任务后 页面出现真实任务卡片和真实智能体快照
- 场景 3. 长轮询状态变化路径. 验证任务状态从 `pending` 演进到 `in_progress` 或其他终态 且页面有可观测变化
- 场景 4. 结果区落地路径. 优先验证真实 `resultSummary` 和 `artifacts` 展示. 如果当前后端没有返回最终结果 则验证真实占位文案或错误信息展示

## 验收标准

- 页面测试由 Playwright 自动执行 不依赖人工点击验收
- FrontEnd 和 MultiAgent 都运行在同一个本地 K8s namespace 的 Pod 中
- MySQL Redis Chroma 均以真实 Pod 和 Service 形式存在
- 浏览器只访问 FrontEnd 地址 不直接访问后端地址
- 浏览器中的 `/api` 请求由 FrontEnd Pod 内 Nginx 转发到真实 `mcp-server` Service
- 测试日志中必须能看到真实的 `GET /api/agents` `POST /api/tasks` 和 `GET /api/tasks/{task_id}` 请求记录
- 所有断言基于真实页面 DOM 和真实后端响应 不允许 mock

## 环境变量

### FrontEnd

- `VITE_API_BASE_URL`: REST BFF 地址 仅用于接口级联调
- `VITE_REST_BFF_TIMEOUT_MS`: 联调测试等待任务推进的最大时长
- `VITE_REST_BFF_POLL_INTERVAL_MS`: 联调测试轮询间隔
- `PLAYWRIGHT_FRONTEND_PORT`: Playwright 本地接入的前端端口
- `PLAYWRIGHT_FRONTEND_BASE_URL`: Playwright 直连的前端地址
- `PLAYWRIGHT_USE_EXTERNAL_BASE_URL`: 设为 `1` 时 不自动拉起本地 dev server

### K8s 验收脚本

- `RISKMONITOR_K8S_NAMESPACE`: 本地 K8s 验收使用的 namespace
- `RISKMONITOR_K8S_BACKEND_RELEASE`: MultiAgent Helm release 名称
- `RISKMONITOR_K8S_FRONTEND_RELEASE`: FrontEnd Helm release 名称
- `RISKMONITOR_K8S_FRONTEND_PORT_FORWARD`: 本地映射端口 默认 `4173`
- `RISKMONITOR_K8S_BACKEND_IMAGE`: 后端镜像名
- `RISKMONITOR_K8S_FRONTEND_IMAGE`: 前端镜像名

## 说明

- 真实联调测试不会 mock 后端响应
- 如果后端运行依赖外部 MySQL Redis LLM 能力 联调结果会真实反映这些依赖是否可达
- 当前这套测试覆盖 API 真实联调 和工作台页面真实联调 两层
- 页面级测试的重点不是像素校验 而是验证真实任务提交流程 轮询结果和智能体快照是否贯通
- 本地进程模式只保留给开发排障使用 不再作为最终验收口径
