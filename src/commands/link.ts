import {flags} from '@oclif/command'
import * as path from 'path'

import Command from '../command'
import {Config} from '../config'
import {exists, readPackage} from '../util'
import log from '../log'

export default class Link extends Command {
  static usage = 'link [PATH...]'
  static description = `Link a local package by path.
  
Multiple paths can be provided to link several packages in a single command.`

  static strict = false

  static examples = [
    `$ emusym link /somewhere/else/my_thing`,
    `$ emusym link /somewhere/else/my_*`,
  ]

  static flags = {
    force: flags.boolean({
      description: 'Allow overwriting existing source links.'
    }),
    scope: flags.string({
      description: 'Add an npm scope to the destination package name.'
    }),
  }

  conf!: Config

  async guessPackageNameWithoutMetadata(srcPath: string) {
    const monoRepoParents = ['../../packages', '../../../packages']
    for (const rel of monoRepoParents) {
      const packagesRoot = path.resolve(srcPath, rel)
      if (await exists(packagesRoot)) {
        return path.relative(packagesRoot, srcPath)
      }
    }
    return path.basename(srcPath)
  }

  async createSourceLink(srcPath: string, force: boolean, scope?: string) {
    let name
    try {
      name = (await readPackage(srcPath)).name
    } catch (err) {
      log.warn(`No package.json in ${srcPath}, using directory name`)
      name = await this.guessPackageNameWithoutMetadata(srcPath)
    }
    if (!name) {
      throw new Error(`Package at ${srcPath} is missing a name`)
    } else if (this.conf.sources[name] && !force) {
      throw new Error(`Package '${name}' is already a link source, refusing to overwrite it`)
    }

    if (scope) {
      name = `${scope}/${name}`
    }

    await this.conf.addSource(name, path.resolve(srcPath))
    log.success(`📦 ${srcPath} → ${name}`)
    return name
  }

  async createDestinationLink(name: string) {
    const dstPath = process.cwd()
    await this.conf.addDestination(dstPath, name)
    log.success(`🔗 ${name} → ${dstPath}`)
  }

  async run() {
    this.conf = await Config.fromDirectory(process.cwd())
    const {argv, flags} = this.parse(Link)
    const args = argv.length ? argv : [undefined]
    for (const packageOrPath of args) {
      if (packageOrPath) {
        const name = await exists(packageOrPath)
          ? await this.createSourceLink(packageOrPath, flags.force, flags.scope)
          : packageOrPath
        await this.createDestinationLink(name)
      } else {
        await this.createSourceLink(process.cwd(), flags.force, flags.scope)
      }
    }
  }
}
