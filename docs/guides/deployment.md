# 部署指南

> RiskMonitor-FrontEnd 部署到火山引擎 ECS 的完整指南。前后端同台部署，nginx 代理，同源无跨域。

## 架构总览

采用"单台 ECS + nginx 代理"的一体化部署方案。前端静态文件和后端 API 服务部署在同一台火山引擎 ECS 上，通过 nginx 统一入口。

```
用户浏览器 (中国)
  → 火山引擎 ECS (公网 IP, nginx :80)
    ├── /          → 前端静态文件 (dist/)
    ├── /api/*     → proxy_pass http://127.0.0.1:8000
    └── /health    → proxy_pass http://127.0.0.1:8000
  → docker-compose (同一台 ECS)
    ├── mcp-server (:8000)
    ├── mysql (:3306)
    ├── redis (:6379)
    └── chroma (:8000 内部)
  → 火山引擎方舟 LLM API (同云内网)
```

**选火山引擎的原因**：

- LLM 已在火山引擎方舟（ark-code-latest），同云内网延迟最低
- 支持支付宝付款
- 中国用户访问无障碍，无需域名和 CDN 即可使用

## 开发环境配置

### Vite 开发代理

本地开发时，前端运行在 `http://localhost:5173`，后端运行在 `http://localhost:8000`。通过 Vite proxy 代理 `/api/*` 请求到后端，避免跨域问题。

在 `vite.config.ts` 中配置：

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true }
    }
  }
})
```

### 环境变量

| 变量 | 开发环境 | 生产环境 | 说明 |
|------|----------|----------|------|
| `VITE_API_BASE_URL` | 空（走 proxy） | 空（同源 nginx 代理） | API 基础地址 |

生产环境前后端同源部署，`VITE_API_BASE_URL` 留空即可，所有 `/api/*` 请求由 nginx 代理到后端。

## 火山引擎 ECS 准备

### 1. 购买 ECS

登录 [火山引擎 ECS 控制台](https://console.volcengine.com/ecs)：

| 配置项 | 推荐值 | 说明 |
|--------|--------|------|
| 实例规格 | 通用型 2C4G | 足以运行 MySQL + Redis + ChromaDB + MCP Server + nginx |
| 镜像 | Ubuntu 22.04 | 长期支持版，Docker 兼容性好 |
| 地域 | 华北2（北京）或华东1（上海） | 与方舟 LLM 同地域，内网延迟最低 |
| 公网带宽 | 按量付费 5Mbps | 省钱，MVP 阶段够用 |
| 付费方式 | 包月 | 比按量便宜 |

支付方式支持支付宝。

### 2. 初始化服务器

SSH 登录后安装必要软件：

```bash
ssh root@<ECS_IP>
apt update && apt install -y docker.io docker-compose-v2 git nginx nodejs npm
```

### 3. 安全组配置

在火山引擎控制台的安全组中开放以下端口：

| 端口 | 协议 | 用途 |
|------|------|------|
| 22 | TCP | SSH 远程登录 |
| 80 | TCP | HTTP 访问 |

## 后端部署

### 1. 克隆仓库并配置

```bash
git clone <repo-url> /opt/riskmonitor
cd /opt/riskmonitor/RiskMonitor-MultiAgent
cp .env.example .env
```

### 2. 编辑环境变量

编辑 `.env` 文件，填入关键配置：

```bash
LLM_API_KEY=<你的方舟 API Key>
MYSQL_ROOT_PASSWORD=<设置一个强密码>
MYSQL_PASSWORD=<同上>
APP_ENV=production
MCP_TRANSPORT=streamable-http
```

### 3. 启动服务

```bash
docker compose up -d
```

验证后端启动：

```bash
curl http://localhost:8000/health
# 应返回 {"status":"ok"}
```

## 前端构建与部署

### 1. 构建前端

```bash
cd /opt/riskmonitor/RiskMonitor-FrontEnd
npm install
npm run build
```

### 2. 部署到 nginx

```bash
mkdir -p /var/www/riskmonitor
cp -r dist/* /var/www/riskmonitor/
```

### 3. 配置 nginx

创建 `/etc/nginx/sites-available/riskmonitor`：

```nginx
server {
  listen 80;
  server_name <ECS_IP>;

  root /var/www/riskmonitor;
  index index.html;

  # SPA 路由 fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API 代理到后端
  location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # 健康检查
  location /health {
    proxy_pass http://127.0.0.1:8000;
  }
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/riskmonitor /etc/nginx/sites-enabled/
nginx -t          # 测试配置
systemctl reload nginx
```

## 端到端验证

### 1. 服务健康检查

```bash
curl http://<ECS_IP>/health
# 应返回 {"status":"ok"}

curl http://<ECS_IP>/api/agents
# 应返回智能体列表
```

### 2. 前端访问

浏览器访问 `http://<ECS_IP>/`，应显示前端界面。

### 3. 功能验证

1. 在任务输入框中输入"查询所有 desk 头寸"
2. 点击提交按钮
3. 观察任务状态从 pending → running → completed
4. 确认智能体状态列表更新
5. 确认最终结果正确展示

## 更新部署

当前端代码有更新时，重新构建并部署：

```bash
cd /opt/riskmonitor/RiskMonitor-FrontEnd
git pull
npm install
npm run build
cp -r dist/* /var/www/riskmonitor/
```

后端代码有更新时：

```bash
cd /opt/riskmonitor/RiskMonitor-MultiAgent
git pull
docker compose up -d --build
```

## 成本估算

| 项目 | 月费用 | 说明 |
|------|--------|------|
| 火山引擎 ECS 2C4G | ~¥50-80 | 包月 |
| 公网带宽 5Mbps | ~¥10-20 | 按量付费 |
| 域名（可选） | ~¥5/月 | .com 域名 |
| **合计** | **~¥60-100/月** | 支付宝付款 |

## 后续升级路径

1. **域名 + HTTPS**：购买域名，nginx 配置 Let's Encrypt 免费 SSL 证书
2. **TOS + CDN 前端加速**：前端静态文件迁移到火山引擎 TOS 对象存储 + CDN，GitHub Actions 自动部署
3. **SSE 替代轮询**：后端增加 SSE 端点桥接 MessageBus，前端升级为实时推送
4. **React Flow 画布**：实现智能体协作可视化
5. **监控接入**：启用 Prometheus + Grafana 容器

## 相关文档

- [环境搭建指南](setup.md) — 本地开发环境配置
- [ADR-0003: 火山引擎部署决策](../decisions/0003-volcengine-deployment.md) — 部署方案选型理由
# 部署指南

> RiskMonitor-FrontEnd 部署到火山引擎 ECS 的完整指南。前后端同台部署，nginx 代理，同源无跨域。

## 架构总览

采用"单台 ECS + nginx 代理"的一体化部署方案。前端静态文件和后端 API 服务部署在同一台火山引擎 ECS 上，通过 nginx 统一入口。

```
用户浏览器 (中国)
  → 火山引擎 ECS (公网 IP, nginx :80)
    ├── /          → 前端静态文件 (dist/)
    ├── /api/*     → proxy_pass http://127.0.0.1:8000
    └── /health    → proxy_pass http://127.0.0.1:8000
  → docker-compose (同一台 ECS)
    ├── mcp-server (:8000)
    ├── mysql (:3306)
    ├── redis (:6379)
    └── chroma (:8000 内部)
  → 火山引擎方舟 LLM API (同云内网)
```

**选火山引擎的原因**：

- LLM 已在火山引擎方舟（ark-code-latest），同云内网延迟最低
- 支持支付宝付款
- 中国用户访问无障碍，无需域名和 CDN 即可使用

## 开发环境配置

### Vite 开发代理

本地开发时，前端运行在 `http://localhost:5173`，后端运行在 `http://localhost:8000`。通过 Vite proxy 代理 `/api/*` 请求到后端，避免跨域问题。

在 `vite.config.ts` 中配置：

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true }
    }
  }
})
```

### 环境变量

| 变量 | 开发环境 | 生产环境 | 说明 |
|------|----------|----------|------|
| `VITE_API_BASE_URL` | 空（走 proxy） | 空（同源 nginx 代理） | API 基础地址 |

生产环境前后端同源部署，`VITE_API_BASE_URL` 留空即可，所有 `/api/*` 请求由 nginx 代理到后端。

## 火山引擎 ECS 准备

### 1. 购买 ECS

登录 [火山引擎 ECS 控制台](https://console.volcengine.com/ecs)：

| 配置项 | 推荐值 | 说明 |
|--------|--------|------|
| 实例规格 | 通用型 2C4G | 足以运行 MySQL + Redis + ChromaDB + MCP Server + nginx |
| 镜像 | Ubuntu 22.04 | 长期支持版，Docker 兼容性好 |
| 地域 | 华北2（北京）或华东1（上海） | 与方舟 LLM 同地域，内网延迟最低 |
| 公网带宽 | 按量付费 5Mbps | 省钱，MVP 阶段够用 |
| 付费方式 | 包月 | 比按量便宜 |

支付方式支持支付宝。

### 2. 初始化服务器

SSH 登录后安装必要软件：

```bash
ssh root@<ECS_IP>
apt update && apt install -y docker.io docker-compose-v2 git nginx nodejs npm
```

### 3. 安全组配置

在火山引擎控制台的安全组中开放以下端口：

| 端口 | 协议 | 用途 |
|------|------|------|
| 22 | TCP | SSH 远程登录 |
| 80 | TCP | HTTP 访问 |

## 后端部署

### 1. 克隆仓库并配置

```bash
git clone <repo-url> /opt/riskmonitor
cd /opt/riskmonitor/RiskMonitor-MultiAgent
cp .env.example .env
```

### 2. 编辑环境变量

编辑 `.env` 文件，填入关键配置：

```bash
LLM_API_KEY=<你的方舟 API Key>
MYSQL_ROOT_PASSWORD=<设置一个强密码>
MYSQL_PASSWORD=<同上>
APP_ENV=production
MCP_TRANSPORT=streamable-http
```

### 3. 启动服务

```bash
docker compose up -d
```

验证后端启动：

```bash
curl http://localhost:8000/health
# 应返回 {"status":"ok"}
```

## 前端构建与部署

### 1. 构建前端

```bash
cd /opt/riskmonitor/RiskMonitor-FrontEnd
npm install
npm run build
```

### 2. 部署到 nginx

```bash
mkdir -p /var/www/riskmonitor
cp -r dist/* /var/www/riskmonitor/
```

### 3. 配置 nginx

创建 `/etc/nginx/sites-available/riskmonitor`：

```nginx
server {
  listen 80;
  server_name <ECS_IP>;

  root /var/www/riskmonitor;
  index index.html;

  # SPA 路由 fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # API 代理到后端
  location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # 健康检查
  location /health {
    proxy_pass http://127.0.0.1:8000;
  }
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/riskmonitor /etc/nginx/sites-enabled/
nginx -t          # 测试配置
systemctl reload nginx
```

## 端到端验证

### 1. 服务健康检查

```bash
curl http://<ECS_IP>/health
# 应返回 {"status":"ok"}

curl http://<ECS_IP>/api/agents
# 应返回智能体列表
```

### 2. 前端访问

浏览器访问 `http://<ECS_IP>/`，应显示前端界面。

### 3. 功能验证

1. 在任务输入框中输入"查询所有 desk 头寸"
2. 点击提交按钮
3. 观察任务状态从 pending → running → completed
4. 确认智能体状态列表更新
5. 确认最终结果正确展示

## 更新部署

当前端代码有更新时，重新构建并部署：

```bash
cd /opt/riskmonitor/RiskMonitor-FrontEnd
git pull
npm install
npm run build
cp -r dist/* /var/www/riskmonitor/
```

后端代码有更新时：

```bash
cd /opt/riskmonitor/RiskMonitor-MultiAgent
git pull
docker compose up -d --build
```

## 成本估算

| 项目 | 月费用 | 说明 |
|------|--------|------|
| 火山引擎 ECS 2C4G | ~¥50-80 | 包月 |
| 公网带宽 5Mbps | ~¥10-20 | 按量付费 |
| 域名（可选） | ~¥5/月 | .com 域名 |
| **合计** | **~¥60-100/月** | 支付宝付款 |

## 后续升级路径

1. **域名 + HTTPS**：购买域名，nginx 配置 Let's Encrypt 免费 SSL 证书
2. **TOS + CDN 前端加速**：前端静态文件迁移到火山引擎 TOS 对象存储 + CDN，GitHub Actions 自动部署
3. **SSE 替代轮询**：后端增加 SSE 端点桥接 MessageBus，前端升级为实时推送
4. **React Flow 画布**：实现智能体协作可视化
5. **监控接入**：启用 Prometheus + Grafana 容器

## 相关文档

- [环境搭建指南](setup.md) — 本地开发环境配置
- [ADR-0003: 火山引擎部署决策](../decisions/0003-volcengine-deployment.md) — 部署方案选型理由
