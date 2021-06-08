import {Command as OClifCommand} from '@oclif/command'

import log from './log'

export default abstract class Command extends OClifCommand {
  async catch(err: Error) {
    log.fatal(err)
  }
}