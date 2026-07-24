import { existsSync, readFileSync } from 'node:fs'

function parseEnvFile(content) {
  const entries = {}

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim()

    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex <= 0) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    entries[key] = value
  }

  return entries
}

export function loadLocalEnvFiles(filePaths) {
  for (const filePath of filePaths) {
    if (!existsSync(filePath)) {
      continue
    }

    const values = parseEnvFile(readFileSync(filePath, 'utf-8'))
    for (const [key, value] of Object.entries(values)) {
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  }
}
