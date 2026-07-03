# 环境搭建指南

> RiskMonitor-FrontEnd 开发环境搭建的完整指南。按照以下步骤即可完成本地开发环境配置。

## 前置要求

### 必需软件

| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|----------|----------|------|
| Node.js | 20.0.0 | 22.x LTS | 运行时环境 |
| npm | 10.0.0 | 10.x | 包管理器（随 Node.js 安装） |
| Git | 2.40.0 | 2.45+ | 版本控制 |

### 可选软件

| 软件 | 用途 |
|------|------|
| pnpm | 替代 npm 的包管理器（更快、更省磁盘） |
| nvm / fnm | Node.js 版本管理 |
| VSCode | 推荐编辑器 |

### 验证环境

```bash
node --version    # 应输出 v20.0.0 或更高
npm --version     # 应输出 10.0.0 或更高
git --version     # 应输出 2.40.0 或更高
```

## 安装步骤

### 1. 克隆仓库

```bash
git clone https://github.com/zhengchuan/RiskMonitor-FrontEnd.git
cd RiskMonitor-FrontEnd
```

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm（需先安装：npm install -g pnpm）
pnpm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

开发服务器启动后，默认运行在 `http://localhost:5173`，支持 HMR 热模块替换。

### 4. 验证安装

```bash
# 代码检查
npm run lint

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

以上命令均无报错则环境搭建成功。

## 开发命令

| 命令 | 说明 | 使用场景 |
|------|------|----------|
| `npm run dev` | 启动开发服务器（HMR） | 日常开发 |
| `npm run build` | 类型检查 + 生产构建 | 发布前验证 |
| `npm run lint` | Oxlint 代码检查 | 提交前检查 |
| `npm run preview` | 预览生产构建 | 验证构建结果 |

## 编辑器推荐配置

### VSCode 推荐插件

| 插件 | 说明 |
|------|------|
| ESLint | 代码检查（兼容 Oxlint 规则） |
| Prettier | 代码格式化 |
| TypeScript ESLint | TS 语法支持 |
| Tailwind CSS IntelliSense | CSS 类名自动补全（如使用） |
| GitLens | Git 增强 |
| Error Lens | 行内错误提示 |
| Mermaid Preview | Mermaid 图表预览 |

### VSCode 配置（.vscode/settings.json）

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### 推荐的 VSCode 扩展推荐文件

在项目根目录创建 `.vscode/extensions.json`：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "bierner.markdown-mermaid"
  ]
}
```

## 常见安装问题排查

### 问题 1：npm install 速度慢或失败

**原因**：默认 npm 源在国内访问较慢。

**解决方案**：切换为国内镜像源。

```bash
# 临时使用淘宝镜像
npm install --registry=https://registry.npmmirror.com

# 永久设置
npm config set registry https://registry.npmmirror.com
```

### 问题 2：Node.js 版本不兼容

**原因**：项目依赖要求 Node.js >= 20.0.0。

**解决方案**：使用 nvm 管理版本。

```bash
nvm install 22
nvm use 22
```

### 问题 3：端口被占用

**原因**：5173 端口已被其他进程占用。

**解决方案**：指定其他端口启动。

```bash
npm run dev -- --port 3000
```

### 问题 4：Oxlint 安装失败

**原因**：Oxlint 依赖平台特定的二进制文件。

**解决方案**：清除缓存后重装。

```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### 问题 5：TypeScript 编译报错

**原因**：TS 配置或类型定义不匹配。

**解决方案**：

```bash
# 检查 TS 版本
npx tsc --version

# 单独运行类型检查
npx tsc --noEmit
```

## 下一步

环境搭建完成后，请阅读 [开发流程指南](development.md) 了解日常开发工作流，以及 [编码规范](../standards/coding-conventions.md) 了解代码风格要求。
