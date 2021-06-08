import * as path from 'path'
import {constants} from 'fs'
import * as fs from 'fs/promises'

export async function exists(filepath: string) {
  try {
    await fs.access(filepath, constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}

export async function readPackage(parent: string) {
  const p = path.resolve(parent, 'package.json')
  if (await exists(p)) {
    return JSON.parse(await fs.readFile(p, {encoding: 'utf8'})) as Record<string, any>
  } else {
    throw new Error(`package.json not found in ${parent}`)
  }
}

export async function ensureParentExists(child: string) {
  const dir = path.dirname(child)
  if (!(await exists(dir))) {
    await fs.mkdir(dir, {recursive: true})
  }
}

export function isSubDirectory(parent: string, child: string): boolean {
  return path.relative(parent, child).split(path.sep)[0] !== '..'
}

export function uniq<T>(values: ReadonlyArray<T>) {
  return Array.from(new Set(values))
}