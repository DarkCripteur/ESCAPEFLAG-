// --- SYSTÈME DE REPLI SUR BASE DE DONNÉES LOCALE JSON ---
import fs from 'fs'
import path from 'path'

export const DATA_DIR = path.resolve('data')
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function readJsonFile(filename, defaultValue = []) {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) return defaultValue
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return defaultValue
  }
}

export function writeJsonFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}
