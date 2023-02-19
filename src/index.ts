import { randomBytes } from 'crypto'
import { inspect } from 'util'

const COLORS = {
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  reset: '\x1b[0m',
}

export interface IAction {
  success(meta?: Record<string, unknown>): Logger
  failure(error: unknown, meta?: Record<string, unknown>): Logger
}

export type Parser = (value?: unknown) => Record<string, unknown> | string | boolean | number | null | undefined

export interface ILoggerOptions {
  silent?: boolean
  colors?: boolean
}

export class Logger {
  private id: string
  private parsers: Record<string, Parser>

  constructor(private options: ILoggerOptions = {}, private loggerMeta: Record<string, unknown> = {}) {
    this.id = randomBytes(8).toString('hex')
    this.parsers = {}
  }

  addMeta(meta: Record<string, unknown>): this {
    if (!this.options.silent) {
      this.loggerMeta = { ...this.loggerMeta, ...this.parseMeta(meta) }
    }
    return this
  }

  private parseMeta(meta: Record<string, unknown> = {}) {
    const result: Record<string, unknown> = {}
    if (!this.options.silent) {
      for (const [name, value] of Object.entries(meta)) {
        if (this.parsers[name]) {
          result[name] = this.parsers[name](value)
        } else {
          result[name] = value
        }
        try {
          JSON.stringify(result[name])
        } catch (error) {
          result[name] = inspect(result[name])
        }
      }
    }
    return result
  }

  setParser(name: string, parser: Parser): this {
    this.parsers[name] = parser
    return this
  }

  action(message: string, meta?: Record<string, unknown>): IAction {
    const actionId = randomBytes(8).toString('hex')
    const actionMeta = { ...this.parseMeta(meta), actionId }
    this.info(message, actionMeta)
    return {
      success: (meta?: Record<string, unknown>) => {
        return this.info(`${message}_success`, { ...actionMeta, ...this.parseMeta(meta) })
      },
      failure: (error: unknown, meta?: Record<string, unknown>) => {
        return this.error(`${message}_failure`, error, { ...actionMeta, ...this.parseMeta(meta) })
      },
    }
  }

  private log(
    level: 'info' | 'warn' | 'error',
    message: string,
    { actionId, ...meta }: Record<string, unknown> = {}
  ): this {
    if (!this.options.silent) {
      const timestamp = new Date().toISOString()
      const trace = { loggerId: this.id, actionId }
      let payload = JSON.stringify({ timestamp, level, message, trace, ...this.loggerMeta, ...meta })
      if (this.options.colors) {
        payload = `${COLORS[level]}${payload}${COLORS.reset}`
      }
      console[level](payload)
    }
    return this
  }

  info(message: string, meta?: Record<string, unknown>): this {
    return this.log('info', message, this.parseMeta(meta))
  }

  warn(message: string, meta?: Record<string, unknown>): this {
    return this.log('warn', message, this.parseMeta(meta))
  }

  error(message: string, error: unknown, meta?: Record<string, unknown>): this {
    return this.log('error', message, this.parseMeta({ error, ...meta }))
  }
}
