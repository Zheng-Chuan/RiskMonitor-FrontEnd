# Phase 1: 浅色工作台与 TaskGraph 可观测性

## 状态

开发中, 代码与单测已完成, 当前进入本地 K8s 部署验收阶段.

## 核心目标

- 在保持当前双应用边界不变的前提下, 让 FrontEnd 从最小闭环页面升级为 Instagram 风格的高质感工作台, 并通过 SSE 事件流实时观察智能体状态, BackEnd 内部记忆变化和真实执行 TaskGraph DAG.

## 时间盒与优先级

- 时间: 1 个迭代
- 优先级: 高

## 工作范围

### In Scope

- 将工作台整体视觉调整为白色和浅色为主的配色体系
- 将主色统一为天蓝色系
- 保证浅色背景下任务状态, 智能体状态和结果区可读性
- 在工作台中新增独立的 Memory Panel
- 通过后端受控读取 Redis 中的记忆内容并在页面展示结构化结果
- 为智能体状态和记忆区域落地 SSE 实时推送
- 为空状态, 加载态和失败态补齐页面反馈
- 删除首页模块并默认以工作台作为主入口
- 将视觉语言重构为 Instagram 风格的圆角卡片, 轻渐变和更强的排版层次
- 将记忆面板拆分为公共记忆和私有记忆两块并支持收放
- 将任务详情从线性步骤列表升级为真实执行 DAG 画布
- 为 TaskGraph 节点和边提供悬停数据面板
- 用颜色区分 TaskGraph 节点和边的执行状态
- 把工作台主背景和画布背景统一收敛为白底

### Out of Scope

- 前端直连 Redis
- 直接展示 Redis 原始键值结构
- 记忆编辑, 删除和人工回写
- 复杂事件流治理平台化

## 开发目标

- Goal 1: 让 FrontEnd 具备 Instagram 风格的高质感浅色工作台视觉基线
- Goal 2: 让用户在任务执行过程中实时观察智能体状态和系统内部记忆变化
- Goal 3: 让记忆展示按公共记忆和私有记忆分组并支持收放
- Goal 4: 让任务详情变成真实执行 DAG 画布, 并支持节点边悬停数据查看
- Goal 5: 让默认入口收敛到工作台, 删除无用首页

## 详细 Checkpoint

- [x] 更新工作台视觉规范为白色和浅色方案
- [x] 定义天蓝色主色及状态色在浅色背景下的使用边界
- [x] 定义 Memory Panel 的位置, 信息层级和空状态文案
- [x] 明确 memory 数据由后端受控读取和整理
- [x] 定义 memory 的 REST BFF 契约或事件接口草案
- [x] 将近实时轮询升级为 SSE 实时推送并补齐断线重连策略
- [x] 为本地单测和构建验收补齐基础验证
- [x] Workspace 页面已新增 Memory Panel, 并补齐空态, 刷新中和失败态反馈
- [x] `GET /api/memory` 与 `GET /api/tasks/{task_id}/memory` 契约已纳入 `docs/architecture/rest-bff-contract.md`
- [x] 前端 memory 类型, API 映射和轮询逻辑已接入工作台主页面
- [x] 删除首页模块并把 `/` 收敛到工作台
- [x] 记忆面板按公共记忆和私有记忆分组并支持整体收放
- [x] 工作台视觉语言向 Instagram 风格重构
- [x] 本地单元测试与生产构建已通过
- [x] 为 TaskGraph 新增 graph REST BFF 与 graph SSE 契约
- [x] 任务详情区域已替换为真实 TaskGraph DAG, 不再只展示步骤列表
- [x] 节点悬停显示节点数据, 边悬停显示边数据
- [x] 节点和边状态已完成颜色区分
- [x] 工作台主背景与任务图底色已统一为白底
- [ ] 本地 K8s 环境下的真实前后端联调与 Playwright 验收待执行

## 验收标准

- 页面整体视觉已切换为白色和浅色主导的方案
- 页面主色为天蓝色系, 且主要交互元素保持一致
- 页面新增独立的 Memory Panel
- Memory Panel 能展示 BackEnd 内部记忆的结构化视图
- 用户在任务执行期间能实时观察智能体状态, 记忆变化和 TaskGraph DAG 的状态变化
- 记忆内容来源于后端受控读取 Redis 的结果, 而不是前端直连 Redis
- 无记忆, 读取中, 读取失败三种状态均有明确页面反馈
- 记忆面板明确区分公共记忆和私有记忆
- 记忆面板支持整体收起和展开
- 任务详情区域展示真实节点和边组成的 TaskGraph DAG
- 节点悬停时可查看节点数据, 边悬停时可查看边数据
- TaskGraph 节点和边状态通过颜色稳定区分
- 工作台主背景与任务图底色统一为白底
- `/` 默认进入工作台, 页面不再保留首页模块
- 新需求对应的接口契约, 页面测试和文档说明完整补齐

## 交付物清单

- 文档: `docs/PRD.md`
- 文档: `docs/phases/phase-1-light-theme-and-memory-observability.md`
- 文档: `docs/architecture/rest-bff-contract.md`
- 导航: `docs/README.md`

## 依赖关系

- 后端需要提供受控的 memory 浏览器接口, 由 REST BFF 面向前端输出
- Redis 中现有记忆结构需要先完成字段梳理和脱敏策略
- 后端需要提供智能体, 记忆和 TaskGraph 的 SSE 事件流接口
- 后端需要提供任务级 graph REST BFF 视图接口

## 风险提醒

- 如果直接暴露 Redis 原始结构, 页面会难以理解且存在信息泄露风险
- 如果 SSE 事件没有做节流和去重, 可能增加后端与浏览器负担
- 如果记忆信息展示过多, 可能增加普通用户认知负担
- 如果视觉只改颜色不改布局和排版层次, 页面仍可能显得杂乱

## 相关文档

- PRD: [../PRD.md](../PRD.md)
- Phase 0: [./phase-0-dual-app-foundation.md](./phase-0-dual-app-foundation.md)
- REST BFF 契约: [../architecture/rest-bff-contract.md](../architecture/rest-bff-contract.md)
