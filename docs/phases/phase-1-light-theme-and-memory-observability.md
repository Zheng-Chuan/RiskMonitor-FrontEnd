# Phase 1: 浅色工作台与记忆可观测性

## 状态

已规划, 待执行

## 核心目标

在保持当前双应用边界和 REST BFF 模式不变的前提下, 让 FrontEnd 从最小闭环页面升级为更适合日常使用的浅色工作台, 并新增对 MultiAgent 内部记忆变化的可观测能力.

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
- 为记忆区域定义近实时刷新 MVP 方案
- 为空状态, 加载态和失败态补齐页面反馈

### Out of Scope

- 前端直连 Redis
- 直接展示 Redis 原始键值结构
- 记忆编辑, 删除和人工回写
- 全量页面信息架构重做
- SSE 正式落地和复杂事件流治理

## 开发目标

- Goal 1: 让 FrontEnd 具备浅色企业工作台的视觉基线
- Goal 2: 让用户在任务执行过程中实时观察系统内部记忆变化
- Goal 3: 让记忆展示通过后端结构化输出接入, 而不是暴露底层 Redis 原始结构

## 详细 Checkpoint

- [ ] 更新工作台视觉规范为白色和浅色方案
- [ ] 定义天蓝色主色及状态色在浅色背景下的使用边界
- [ ] 定义 Memory Panel 的位置, 信息层级和空状态文案
- [ ] 明确 memory 数据由后端受控读取和整理
- [ ] 定义 memory 的 REST BFF 契约或事件接口草案
- [ ] 定义近实时刷新 MVP 策略和频率边界
- [ ] 为页面和接口联调补齐验收标准

## 验收标准

- 页面整体视觉已切换为白色和浅色主导的方案
- 页面主色为天蓝色系, 且主要交互元素保持一致
- 页面新增独立的 Memory Panel
- Memory Panel 能展示 MultiAgent 内部记忆的结构化视图
- 用户在任务执行期间能观察到记忆变化
- 记忆内容来源于后端受控读取 Redis 的结果, 而不是前端直连 Redis
- 无记忆, 读取中, 读取失败三种状态均有明确页面反馈
- 新需求对应的接口契约, 页面测试和文档说明完整补齐

## 交付物清单

- 文档: `docs/PRD.md`
- 文档: `docs/phases/phase-1-light-theme-and-memory-observability.md`
- 文档: `docs/architecture/rest-bff-contract.md`
- 导航: `docs/README.md`

## 依赖关系

- 后端需要提供受控的 memory 浏览器接口, 由 REST BFF 面向前端输出
- Redis 中现有记忆结构需要先完成字段梳理和脱敏策略
- 前端需要复用当前任务和智能体轮询机制的经验, 定义 memory 的刷新模式

## 风险提醒

- 如果直接暴露 Redis 原始结构, 页面会难以理解且存在信息泄露风险
- 如果记忆刷新频率过高, 可能增加 Redis 和后端压力
- 如果记忆信息展示过多, 可能增加普通用户认知负担
- 如果浅色主题只改颜色不改层次, 页面仍可能显得杂乱

## 相关文档

- PRD: [../PRD.md](../PRD.md)
- Phase 0: [./phase-0-dual-app-foundation.md](./phase-0-dual-app-foundation.md)
- REST BFF 契约: [../architecture/rest-bff-contract.md](../architecture/rest-bff-contract.md)
