import * as chokidar from 'chokidar';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as packlist from 'npm-packlist'

import Command from '../command'
import {Config} from '../config'
import {ensureParentExists, exists, isSubDirectory} from '../util'
import log from '../log'
import type {Logger} from '../log'

type CleanupFunction = () => Promise<void> | undefined

export default class Start extends Command {
  static description = `Start watching and syncing linked packages.
  
Packages previously linked with the 'link' command will be watched and changes
synced back to ./node_modules. Only pack files (npm pack) from the source
packages will be synced, meaning each package is responsible for producing its
own changes to be synced.
`

  conf!: Config
  cleanups: Array<CleanupFunction | undefined> = []
  dstRoot!: string

  get dstModuleRoot(): string {
    return path.resolve(this.dstRoot, 'node_modules')
  }

  async init() {
    const stopProcess = async () => {
      for (const cleanup of this.cleanups) {
        await cleanup?.()
      }
      process.exit(0)
    }
    process.on('SIGTERM', stopProcess)
    process.on('SIGINT', stopProcess)
  }

  async preserveExistingModule(logger: Logger, srcName: string) {
    const modulePath = path.resolve(this.dstModuleRoot, srcName)
    if (await exists(modulePath)) {
      const safeLocation = modulePath + '.__original__'
      if (await exists(safeLocation)) {
        throw new Error(`Found previous process, aborting: ${safeLocation}`)
      }
      logger.info(`☔️  Preserving existing module`)
      await fs.rename(modulePath, safeLocation)
      return async () => {
        logger.info(`☀️  Restoring original module`)
        await fs.rm(modulePath, {recursive: true})
        await fs.rename(safeLocation, modulePath)
      }
    }
    return undefined
  }

  async watch(logger: Logger, srcName: string) {
    const sourcePath = this.conf.sources[srcName]
    let packageFiles = await packlist({path: sourcePath})
    logger.info(`Linking ${sourcePath} → ${this.dstRoot}`)

    // TODO: Is it necessary to remove the destination to avoid stale files?
    const watcher = chokidar.watch(sourcePath, {ignored: ['**/node_modules/**']})
    watcher.on('all', async (eventName, eventPath) => {
        const relPath = path.relative(sourcePath, eventPath)
        const dstPath = path.resolve(this.dstModuleRoot, srcName, relPath)

        // Avoid doing any work outside of the destination modules root.
        if (!relPath || !isSubDirectory(this.dstModuleRoot, dstPath)) {
          return
        }

        // File events for paths not in the NPM pack list are ignored.
        const newPackageFiles = await packlist({path: sourcePath})
        if (eventName !== 'addDir' && eventName !== 'unlinkDir') {
          const checkPackageFiles = eventName === 'add'
            ? newPackageFiles
            : packageFiles
          if (!checkPackageFiles.includes(relPath)) {
            logger.warn(`Ignoring ${relPath}, not in npm pack list`)
            return
          }
        }
        packageFiles = newPackageFiles
        // TODO: Fabricate a package.json?

        logger[eventName](relPath)

        switch (eventName) {
          case 'addDir':
            await fs.mkdir(dstPath, {recursive: true})
            break
          case 'unlinkDir':
            await fs.rm(dstPath, {recursive: true})
            break
          case 'add':
          case 'change': {
            await ensureParentExists(dstPath)
            await fs.copyFile(eventPath, dstPath)
            break
          }
          case 'unlink': {
            fs.rm(dstPath)
            break
          }
        }
      }) 

    return async () => {
      logger.info('Stopping watcher…')
      await watcher.close()
    }
  }

  async run() {
    const {args, flags} = this.parse(Start)
    // TODO: This should maybe walk upwards to a package.json?
    this.conf = await Config.fromDirectory(process.cwd())

    // FIXME: Don't hardcode this.
    // const dstRoot = process.cwd()
    this.dstRoot = '/Users/jonathan/Coding/test/dst1'
    const srcNames = this.conf.destinations[this.dstRoot]
    if (!srcNames?.length) {
      throw new Error(`No sources for ${this.dstRoot}`)
    }

    for (const srcName of srcNames) {
      const logger = log.scope(srcName)
      this.cleanups.unshift(await this.preserveExistingModule(logger, srcName))
      this.cleanups.unshift(await this.watch(logger, srcName))
    }
  }
}
