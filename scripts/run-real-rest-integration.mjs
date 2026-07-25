import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { loadLocalEnvFiles } from './load-local-env.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')
const backendRoot = process.env.RISKAGENT_BACKEND_ROOT
  ? path.resolve(process.env.RISKAGENT_BACKEND_ROOT)
  : path.resolve(frontendRoot, '../RiskAgent-BackEnd')
const backendPort = process.env.RISKAGENT_BACKEND_PORT ?? '18080'
const backendHost = process.env.RISKAGENT_BACKEND_HOST ?? '127.0.0.1'
const backendBaseUrl = process.env.VITE_API_BASE_URL ?? `http://${backendHost}:${backendPort}`
const backendEntry = process.env.RISKAGENT_BACKEND_ENTRY ?? 'main.py'
const backendPython = process.env.RISKAGENT_BACKEND_PYTHON ?? '/Users/zhengchuan/anaconda3/envs/MCP/bin/python'
const healthUrl = `${backendBaseUrl}/health`

loadLocalEnvFiles([
  path.join(frontendRoot, '.env.local'),
  path.join(backendRoot, '.env'),
])

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function waitForHealth(timeoutMs) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(healthUrl)
      if (response.ok) {
        return
      }
    } catch {}

    await sleep(1_000)
  }

  throw new Error(`backend health check timed out: ${healthUrl}`)
}

function terminate(childProcess) {
  if (!childProcess || childProcess.killed) {
    return
  }

  childProcess.kill('SIGTERM')
}

async function main() {
  await access(path.join(backendRoot, backendEntry))
  await access(backendPython)

  const backendProcess = spawn(
    backendPython,
    [backendEntry],
    {
      cwd: backendRoot,
      env: {
        ...process.env,
        APP_ENV: process.env.APP_ENV ?? 'production',
        MCP_TRANSPORT: 'streamable-http',
        FASTMCP_HOST: backendHost,
        FASTMCP_PORT: backendPort,
      },
      stdio: 'inherit',
    },
  )

  const cleanup = () => terminate(backendProcess)
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  process.on('exit', cleanup)

  try {
    await waitForHealth(45_000)

    const vitestExitCode = await new Promise((resolve, reject) => {
      const vitestProcess = spawn(
        process.platform === 'win32' ? 'npx.cmd' : 'npx',
        ['vitest', 'run', 'tests/integration/rest-bff.real.test.ts'],
        {
          cwd: frontendRoot,
          env: {
            ...process.env,
            VITE_API_BASE_URL: backendBaseUrl,
          },
          stdio: 'inherit',
        },
      )

      vitestProcess.on('error', reject)
      vitestProcess.on('exit', (code) => {
        resolve(code ?? 1)
      })
    })

    process.exit(Number(vitestExitCode))
  } finally {
    terminate(backendProcess)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
