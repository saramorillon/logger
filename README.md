# Logger

0 dependencies stdout logger, with actions, meta and parsers.

# Table of contents

- [Create a logger](#createalogger)
- [useFetch](#usefetch)
- [usePagination](#usepagination)
- [useForm](#useform)
- [useCopy](#usecopy)
- [useDrag/useDrop](#usedrag/usedrop)
- [Contribute](#contribute)

# Quick Start

First, install the logger using your favourite package manager:

```bash
# npm
npm install --save @saramorillon/logger
# yarn
yarn add @saramorillon/logger
```

You can now create a new instance of logger:

```typescript
import { Logger, ILoggerOptions } from '@saramorillon/logger'

const options: ILoggerOptions = {
  silent: false,
}

const metadata: Record<string, unknown> = {
  loggerId: 'my-awesome-logger',
}

const logger = new Logger(options, metadata)

logger.info('This is a good day!')
```

This code will produce:

```json
{
    "timestamp": <current date>,
    "level": "info",
    "message": "This is a good day!",
    "loggerId": "my-awesome-logger"
}
```

Note that metadata are optional.

## Options

| Name   | Default value | Mandatory | Description                                     |
| ------ | ------------- | --------- | ----------------------------------------------- |
| silent | false         | No        | Set to true if you want the logger to be silent |

# About metadata

- Metadata are optional
- You can put everything you want in metadata
- Metadata will be logged with every log message
- Metadata can be formatted using parsers

# About parsers

When logging properties in metadata, sometimes you don't want to log full payload but only a subset of properties. For that, you can use parsers. You can define a parser using the `setParser` method. A parser is a function associated to a property name. When logging, when the logger encounter a metadata with that name, it will parse the value.

## Example

```typescript
import { Logger, ILoggerOptions } from '@saramorillon/logger'

const fullObject = {
  prop1: 'value1',
  prop2: 'value2',
  prop3: 'value3',
}

const logger = new Logger()
logger.addMeta(fullObject)
logger.info('Log without parser') // 1

function parser(meta: unknown): Record<string, unknown> | undefined {
  if (typeof obj === 'object' && obj !== null) {
    return meta.prop1
  }
}
logger.setParser('fullObject', parser)
logger.info('Log with parser') // 2
```

1. This will produce a log with the full metadata payload:

```json
{
    "timestamp": <current date>,
    "level": "info",
    "message": "Log without parser",
    "prop1": "value1",
    "prop2": "value2",
    "prop3": "value3"
}
```

2. This will produce a log with parsed metadata payload:

```json
{
    "timestamp": <current date>,
    "level": "info",
    "message": "Log with parser",
    "prop1": "value1"
}
```

# About actions

An action is a set of logs starting with a `starting log` and ending with a `success log` or a `failure log`, depending on the result. This logger provides an easy way to describe actions sharing the same metadata and a unique action ID.

## Example

```typescript
import { Logger, ILoggerOptions } from '@saramorillon/logger'

const logger = new Logger()

let action = logger.action('first_action') // 1
try {
  // Do nothing
  action.success() // 2
} catch (error) {
  action.failure(error) // 3
}

action = logger.action('second_action') // 4
try {
  throw new Error('This is an error')
  action.success() // 5
} catch (error) {
  action.failure(error) // 6
}
```

1. This will produce the first action `starting log`:

```json
{
    "timestamp": <current date>,
    "level": "info",
    "message": "first_action"
}
```

2. This will produce the first action `success log`:

```json
{
    "timestamp": <current date>,
    "level": "info",
    "message": "first_action_success"
}
```

3. This will produce nothing.

4. This will produce the second action `starting log`:

```json
{
    "timestamp": <current date>,
    "level": "info",
    "message": "second_action"
}
```

5. This will produce nothing.

6. This will produce the second action `failure log`:

```json
{
    "timestamp": <current date>,
    "level": "error",
    "message": "second_action_failure",
    "error": {} // Not that without an appropriate parser, errors will be stringified as an empty object
}
```

# API

| Method                                                              | Description                                 |
| ------------------------------------------------------------------- | ------------------------------------------- |
| `addMeta(meta2: Record<string, unknown>): Logger`                   | Add a new property to logger metadata       |
| `setParser(name: string, parser: Parser): Logger`                   | Add a new parser for specific metadata name |
| `action(message: string, meta2?: Record<string, unknown>): IAction` | Start a new action                          |
| `info(message: string, meta2?: Record<string, unknown>): Logger`    | Log using info level                        |
| `warn(message: string, meta2?: Record<string, unknown>): Logger`    | Log using warn level                        |
| `error(message: string, meta2?: Record<string, unknown>): Logger`   | Log using error level                       |
