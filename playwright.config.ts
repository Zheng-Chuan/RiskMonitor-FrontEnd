import { defineConfig } from '@playwright/test'

const backendHost = process.env.RISKMONITOR_BACKEND_HOST ?? '127.0.0.1'
const backendPort = process.env.RISKMONITOR_BACKEND_PORT ?? '18080'
const frontendPort = process.env.PLAYWRIGHT_FRONTEND_PORT ?? '4173'
const useExternalBaseUrl = process.env.PLAYWRIGHT_USE_EXTERNAL_BASE_URL === '1'
const backendPython = process.env.RISKMONITOR_BACKEND_PYTHON ?? '/Users/zhengchuan/anaconda3/envs/MCP/bin/python'
const backendRoot = process.env.RISKMONITOR_BACKEND_ROOT ?? '../RiskMonitor-MultiAgent'
const backendEntry = process.env.RISKMONITOR_BACKEND_ENTRY ?? 'main.py'
const backendBaseUrl = process.env.VITE_API_BASE_URL ?? `http://${backendHost}:${backendPort}`
const frontendBaseUrl = process.env.PLAYWRIGHT_FRONTEND_BASE_URL ?? `http://127.0.0.1:${frontendPort}`

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: frontendBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: useExternalBaseUrl
    ? undefined
    : [
        {
          command: `${backendPython} ${backendEntry}`,
          cwd: backendRoot,
          url: `${backendBaseUrl}/health`,
          reuseExistingServer: true,
          timeout: 45_000,
          env: {
            ...process.env,
            APP_ENV: process.env.APP_ENV ?? 'production',
            MCP_TRANSPORT: 'streamable-http',
            FASTMCP_HOST: backendHost,
            FASTMCP_PORT: backendPort,
          },
        },
        {
          command: `npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
          cwd: '.',
          url: `${frontendBaseUrl}/workspace`,
          reuseExistingServer: true,
          timeout: 30_000,
          env: {
            ...process.env,
            VITE_API_BASE_URL: '',
            VITE_API_PROXY_TARGET: backendBaseUrl,
          },
        },
      ],
})
