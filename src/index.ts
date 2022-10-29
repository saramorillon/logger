import { randomBytes } from 'crypto'
import { inspect } from 'util'

export interface IAction {
  success(meta?: Record<string, unknown>): Logger
  failure(error: unknown, meta?: Record<string, unknown>): Logger
}

export type Parser = (value?: unknown) => Record<string, unknown> | undefined

export interface ILoggerOptions {
  silent?: boolean
}

export class Logger {
  private parsers: Record<string, Parser> = {}

  constructor(private options: ILoggerOptions = {}, private meta1: Record<string, unknown> = {}) {}

  addMeta(meta2: Record<string, unknown>): this {
    this.meta1 = { ...this.meta1, ...meta2 }
    return this
  }

  setParser(name: string, parser: Parser): this {
    this.parsers[name] = parser
    return this
  }

  action(message: string, meta2?: Record<string, unknown>): IAction {
    const actionId = randomBytes(8).toString('hex')
    this.info(message, { ...meta2, actionId })
    return {
      success: (meta3?: Record<string, unknown>) => {
        return this.info(`${message}_success`, { ...meta2, ...meta3, actionId })
      },
      failure: (error: unknown, meta3?: Record<string, unknown>) => {
        return this.error(`${message}_failure`, { ...meta2, ...meta3, actionId, error })
      },
    }
  }

  private log(level: 'warn' | 'error' | 'info', message: string, meta2: Record<string, unknown> = {}): this {
    if (!this.options.silent) {
      const meta: Record<string, unknown> = {}
      for (const [name, value] of Object.entries({ ...this.meta1, ...meta2 })) {
        if (this.parsers[name]) {
          meta[name] = this.parsers[name](value)
        } else {
          meta[name] = value
        }
      }
      let payload: unknown = { timestamp: new Date().toISOString(), level, message, ...meta }
      try {
        payload = JSON.stringify(payload)
      } catch (error) {
        payload = inspect(payload)
      }
      console[level](payload)
    }
    return this
  }

  info(message: string, meta2?: Record<string, unknown>): this {
    return this.log('info', message, meta2)
  }

  warn(message: string, meta2?: Record<string, unknown>): this {
    return this.log('warn', message, meta2)
  }

  error(message: string, meta2?: Record<string, unknown>): this {
    return this.log('error', message, meta2)
  }
}
