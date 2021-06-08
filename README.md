# emusym: Emulate symlinks


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/emusym.svg)](https://npmjs.org/package/emusym)
[![Downloads/week](https://img.shields.io/npm/dw/emusym.svg)](https://npmjs.org/package/emusym)
[![License](https://img.shields.io/npm/l/emusym.svg)](https://github.com/jonathan/emusym/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g emusym
$ emusym COMMAND
running command...
$ emusym (-v|--version|version)
emusym/0.0.0 darwin-x64 node-v14.16.0
$ emusym --help [COMMAND]
USAGE
  $ emusym COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`emusym help [COMMAND]`](#emusym-help-command)
* [`emusym link [PACKAGE_OR_PATH...]`](#emusym-link-package_or_path)
* [`emusym start`](#emusym-start)

## `emusym help [COMMAND]`

display help for emusym

```
USAGE
  $ emusym help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `emusym link [PACKAGE_OR_PATH...]`

describe the command here

```
USAGE
  $ emusym link [PACKAGE_OR_PATH...]

OPTIONS
  --force
  --scope=scope

EXAMPLES
  $ emusym link /somewhere/else/my_thing
  $ emusym link /somewhere/else/my_*
```

_See code: [src/commands/link.ts](https://github.com/jonathanj/emusym/blob/v0.0.0/src/commands/link.ts)_

## `emusym start`

Start watching and syncing linked packages.

```
USAGE
  $ emusym start

DESCRIPTION
  Packages previously linked with the 'link' command will be watched and changes
  synced back to ./node_modules. Only pack files (npm pack) from the source
  packages will be synced, meaning each package is responsible for producing its
  own changes to be synced.
```

_See code: [src/commands/start.ts](https://github.com/jonathanj/emusym/blob/v0.0.0/src/commands/start.ts)_
<!-- commandsstop -->
