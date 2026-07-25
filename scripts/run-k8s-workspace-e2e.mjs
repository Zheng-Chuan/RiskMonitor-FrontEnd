import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { loadLocalEnvFiles } from './load-local-env.mjs'

const __filename = fileURLToPath(import.meta.url)
const frontendRoot = path.resolve(path.dirname(__filename), '..')
const repoRoot = path.resolve(frontendRoot, '..')
const backendRoot = path.resolve(repoRoot, 'RiskAgent-BackEnd')

const namespace = process.env.RISKAGENT_K8S_NAMESPACE ?? 'riskagent-e2e'
const backendRelease = process.env.RISKAGENT_K8S_BACKEND_RELEASE ?? 'riskagent'
const frontendRelease = process.env.RISKAGENT_K8S_FRONTEND_RELEASE ?? 'riskagent-frontend'
const frontendPort = process.env.RISKAGENT_K8S_FRONTEND_PORT_FORWARD ?? '4173'
const frontendService = process.env.RISKAGENT_K8S_FRONTEND_SERVICE ?? 'riskagent-frontend'
const frontendBaseUrl = process.env.PLAYWRIGHT_FRONTEND_BASE_URL ?? `http://127.0.0.1:${frontendPort}`
const imageTag = process.env.RISKAGENT_K8S_IMAGE_TAG ?? `k8s-local-${Date.now()}`
const backendImageRef = process.env.RISKAGENT_K8S_BACKEND_IMAGE ?? `riskagent/backend:${imageTag}`
const frontendImageRef = process.env.RISKAGENT_K8S_FRONTEND_IMAGE ?? `riskagent/frontend:${imageTag}`

loadLocalEnvFiles([
  path.join(frontendRoot, '.env.local'),
  path.join(backendRoot, '.env'),
])

function parseImageRef(imageRef) {
  const lastSlashIndex = imageRef.lastIndexOf('/')
  const lastColonIndex = imageRef.lastIndexOf(':')

  if (lastColonIndex > lastSlashIndex) {
    return {
      repository: imageRef.slice(0, lastColonIndex),
      tag: imageRef.slice(lastColonIndex + 1),
    }
  }

  return {
    repository: imageRef,
    tag: 'latest',
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? frontendRoot,
      env: options.env ?? process.env,
      stdio: options.stdio ?? 'inherit',
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 'unknown'}`))
    })
  })
}

function runCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const child = spawn(command, args, {
      cwd: options.cwd ?? frontendRoot,
      env: options.env ?? process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(stdout.trim())
        return
      }

      reject(new Error(`${command} ${args.join(' ')} failed with code ${code ?? 'unknown'}\n${stderr.trim()}`))
    })
  })
}

async function waitForHttpReady(url, timeoutMs) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // 端口转发和容器启动阶段允许短暂失败.
    }

    await delay(1_000)
  }

  throw new Error(`Timed out waiting for ${url}`)
}

async function startPortForward() {
  const child = spawn(
    'kubectl',
    [
      'port-forward',
      `svc/${frontendService}`,
      `${frontendPort}:80`,
      '-n',
      namespace,
    ],
    {
      cwd: repoRoot,
      env: process.env,
      stdio: 'inherit',
    },
  )

  await delay(2_000)

  if (child.exitCode !== null && child.exitCode !== 0) {
    throw new Error(`kubectl port-forward exited early with code ${child.exitCode}`)
  }

  return child
}

async function main() {
  const backendImage = parseImageRef(backendImageRef)
  const frontendImage = parseImageRef(frontendImageRef)
  const backgroundProcesses = []

  const cleanup = () => {
    for (const child of backgroundProcesses) {
      if (!child.killed) {
        child.kill('SIGTERM')
      }
    }
  }

  process.on('SIGINT', () => {
    cleanup()
    process.exit(130)
  })

  process.on('SIGTERM', () => {
    cleanup()
    process.exit(143)
  })

  try {
    console.log('==> Build backend image')
    await runCommand('docker', ['build', '-t', backendImageRef, '-f', 'Dockerfile', '.'], {
      cwd: backendRoot,
    })

    console.log('==> Build frontend image')
    await runCommand('docker', ['build', '-t', frontendImageRef, '-f', 'Dockerfile', '.'], {
      cwd: frontendRoot,
    })

    console.log('==> Deploy backend release to local K8s')
    const backendHelmArgs = [
      'upgrade',
      '--install',
      backendRelease,
      'deploy/k8s',
      '-f',
      'deploy/k8s/values-local-e2e.yaml',
      '--set',
      `image.repository=${backendImage.repository}`,
      '--set',
      `image.tag=${backendImage.tag}`,
      '-n',
      namespace,
      '--create-namespace',
    ]

    if (process.env.LLM_API_KEY) {
      backendHelmArgs.push('--set', `llm.apiKey=${process.env.LLM_API_KEY}`)
    }

    await runCommand('helm', backendHelmArgs, { cwd: backendRoot })

    console.log('==> Deploy frontend release to local K8s')
    await runCommand(
      'helm',
      [
        'upgrade',
        '--install',
        frontendRelease,
        'deploy/helm/riskagent-frontend',
        '-f',
        'deploy/helm/riskagent-frontend/values-local-e2e.yaml',
        '--set',
        `image.repository=${frontendImage.repository}`,
        '--set',
        `image.tag=${frontendImage.tag}`,
        '-n',
        namespace,
        '--create-namespace',
      ],
      { cwd: frontendRoot },
    )

    console.log('==> Wait for middleware and app readiness')
    await runCommand('kubectl', ['rollout', 'status', 'statefulset/mysql', '-n', namespace, '--timeout=300s'], {
      cwd: repoRoot,
    })
    await runCommand('kubectl', ['rollout', 'status', 'statefulset/redis', '-n', namespace, '--timeout=300s'], {
      cwd: repoRoot,
    })
    await runCommand('kubectl', ['rollout', 'status', 'statefulset/chroma', '-n', namespace, '--timeout=300s'], {
      cwd: repoRoot,
    })
    await runCommand(
      'kubectl',
      ['rollout', 'status', `deployment/${backendRelease}-mcp-server`, '-n', namespace, '--timeout=300s'],
      { cwd: repoRoot },
    )
    await runCommand(
      'kubectl',
      ['rollout', 'status', `deployment/${frontendService}`, '-n', namespace, '--timeout=300s'],
      { cwd: repoRoot },
    )

    console.log('==> Port-forward frontend service')
    const portForward = await startPortForward()
    backgroundProcesses.push(portForward)

    await waitForHttpReady(`${frontendBaseUrl}/workspace`, 30_000)

    console.log('==> Run Playwright workspace scenarios against local K8s')
    await runCommand(
      'npx',
      ['playwright', 'test', 'tests/e2e/workspace.real.spec.ts'],
      {
        cwd: frontendRoot,
        env: {
          ...process.env,
          PLAYWRIGHT_USE_EXTERNAL_BASE_URL: '1',
          PLAYWRIGHT_FRONTEND_BASE_URL: frontendBaseUrl,
          PLAYWRIGHT_FRONTEND_PORT: frontendPort,
        },
      },
    )

    console.log('==> Collect K8s evidence')
    await runCommand('kubectl', ['get', 'pods', '-n', namespace, '-o', 'wide'], { cwd: repoRoot })
    await runCommand('kubectl', ['get', 'svc', '-n', namespace], { cwd: repoRoot })
    await runCommand('kubectl', ['logs', `deployment/${backendRelease}-mcp-server`, '-n', namespace, '--tail=200'], {
      cwd: repoRoot,
    })

    const frontendUrl = await runCapture(
      'kubectl',
      ['get', 'svc', frontendService, '-n', namespace, '-o', 'jsonpath={.metadata.name}'],
      { cwd: repoRoot },
    )

    console.log(`==> Frontend service ready: ${frontendUrl}`)
    console.log(`==> Playwright base url: ${frontendBaseUrl}`)
  } finally {
    cleanup()
  }
}

await main()
