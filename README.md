emusym: Emulate symlinks
========================


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/emusym.svg)](https://npmjs.org/package/emusym)
[![Downloads/week](https://img.shields.io/npm/dw/emusym.svg)](https://npmjs.org/package/emusym)
[![License](https://img.shields.io/npm/l/emusym.svg)](https://github.com/jonathan/emusym/blob/master/package.json)

This tool emulates symlinks by watching source packages for changes, copying
changed distribution files (as seen in `npm pack`) into the destination
package's `node_modules`.

When doing local development on dependencies, `npm link` (or `yarn link`) is a
very convenient workflow tool. Unfortunately in some cases build tools do not
support symlinks in `node_modules`, most (in)famously [React Native's Metro bundler](https://github.com/facebook/metro/issues/1).

What this tool does _not_ do is create the changes to sync, that is left up to
each package to produce via the most suitable mechanism. Most build tools offer
something like a `--watch` flag that will incrementally build new output.

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->


# Usage
```sh-session
## Install the tool as a dev dependency
$ yarn add -D emusym   # Or `npm install --save-dev emusym` if using npm.

## Link a source package (`other-package`) to the current package.
$ yarn emusym link ../my/other-package
✔  success      📦 ../my/other-package → other-package
✔  success      🔗 other-package → .

## Start watching and syncing changes…
$ yarn emusym start
[other-package] › ℹ  info         ☔️  Preserving existing module
[other-package] › ℹ  info         Linking ../my/other-package → .
[other-package] › ▲  add:file     package.json
[other-package] › ▲  add:dir      src
[other-package] › ▲  add:file     src/index.js
[other-package] › ●  change:file  src/index.js
[other-package] › ▲  add:file     src/new.js
[other-package] › ●  change:file  src/new.js
[other-package] › ▼  del:file     src/new.js
```


# Commands
<!-- commands -->
* [`emusym help [COMMAND]`](#emusym-help-command)
* [`emusym link [PATH...]`](#emusym-link-path)
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

## `emusym link [PATH...]`

Link a local package by path.

```
USAGE
  $ emusym link [PATH...]

OPTIONS
  --force        Allow overwriting existing source links.
  --scope=scope  Add an npm scope to the destination package name.

DESCRIPTION
  Multiple paths can be provided to link several packages in a single command.

EXAMPLES
  $ emusym link /somewhere/else/my_thing
  $ emusym link /somewhere/else/my_*
```

_See code: [src/commands/link.ts](https://github.com/jonathanj/emusym/blob/v0.1.1/src/commands/link.ts)_

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

_See code: [src/commands/start.ts](https://github.com/jonathanj/emusym/blob/v0.1.1/src/commands/start.ts)_
<!-- commandsstop -->
