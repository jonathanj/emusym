import {Signale} from 'signale'

const logger = new Signale({
  types: {
    addDir: {
      badge: '▲',
      color: 'green',
      label: 'add:dir',
      logLevel: 'info',
    },
    add: {
      badge: '▲',
      color: 'green',
      label: 'add:file',
      logLevel: 'info',
    },
    change: {
      badge: '●',
      color: 'yellowBright',
      label: 'change:file',
      logLevel: 'info',
    },
    unlinkDir: {
      badge: '▼',
      color: 'red',
      label: 'del:dir',
      logLevel: 'info',
    },
    unlink: {
      badge: '▼',
      color: 'red',
      label: 'del:file',
      logLevel: 'info',
    },
  }
})

export type Logger = typeof logger
export default logger