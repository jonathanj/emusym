import * as path from 'path'
import * as fs from 'fs/promises'

import {exists, uniq} from './util'

export type ConfigData = {
  /**
   * Mapping of package name to project root path.
   */
  sources: Record<string, string>
  /**
   * Mapping of destination path to source package names.
   */
  destinations: Record<string, Array<string>>
}

const defaultConfig: ConfigData = {
  sources: {},
  destinations: {},
}

async function _read(configPath: string) {
  if (!(await exists(configPath))) {
    return defaultConfig
  }
  return JSON.parse(await fs.readFile(configPath, {encoding: 'utf8'})) as ConfigData
}

async function _write(configPath: string, data: ConfigData) {
  if (!(await exists(configPath))) {
    await fs.mkdir(path.dirname(configPath), {recursive: true})
  }
  await fs.writeFile(configPath, JSON.stringify(data), {encoding: 'utf8'})
  return data
}

export class Config {
  _configPath: string
  _config: ConfigData

  static async fromDirectory(dir: string) {
    const configPath = path.resolve(dir, '.mylinkjobbie.json')
    return new Config(configPath, await _read(configPath))
  }

  constructor(configPath: string, config: ConfigData) {
    this._configPath = configPath
    this._config = config
  }

  get sources(): ConfigData['sources'] {
    return this._config.sources
  }

  async addSource(name: string, srcPath: string) {
    this._config = await _write(this._configPath, {
      ...this._config,
      sources: {
        ...this.sources,
        [name]: srcPath,
      }
    })
  }

  get destinations(): ConfigData['destinations'] {
    return this._config.destinations
  }

  async addDestination(dstPath: string, srcName: string) {
    if (!this.sources[srcName]) {
      throw new Error(`No package named '${srcName}' is a source link`)
    }

    this._config = await _write(this._configPath, {
      ...this._config,
      destinations: {
        ...this._config.destinations,
        [dstPath]: uniq([
          ...this._config.destinations[dstPath] ?? [],
          srcName,
        ]),
      }
    })
  }
}