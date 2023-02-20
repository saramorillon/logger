import { randomBytes } from 'crypto'

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

export interface ILoggerOptions {
  silent?: boolean
  colors?: boolean
}

export class Logger {
  private id: string

  constructor(private options: ILoggerOptions = {}, private loggerMeta: Record<string, unknown> = {}) {
    this.id = randomBytes(8).toString('hex')
  }

  addMeta(meta: Record<string, unknown>): this {
    if (!this.options.silent) {
      this.loggerMeta = { ...this.loggerMeta, ...meta }
    }
    return this
  }

  start(message: string, meta?: Record<string, unknown>): IAction {
    const actionId = randomBytes(8).toString('hex')
    const actionMeta = { ...meta, actionId }
    this.info(message, actionMeta)
    return {
      success: (meta?: Record<string, unknown>) => {
        return this.info(`${message}_success`, { ...actionMeta, ...meta })
      },
      failure: (error: unknown, meta?: Record<string, unknown>) => {
        return this.error(`${message}_failure`, error, { ...actionMeta, ...meta })
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
      let payload = JSON.stringify({ level, timestamp, message, trace, ...this.loggerMeta, ...meta })
      if (this.options.colors) {
        payload = payload.replace(`"${level}"`, `"${COLORS[level]}${level}${COLORS.reset}"`)
      }
      console[level](payload)
    }
    return this
  }

  info(message: string, meta?: Record<string, unknown>): this {
    return this.log('info', message, meta)
  }

  warn(message: string, meta?: Record<string, unknown>): this {
    return this.log('warn', message, meta)
  }

  error(message: string, error: unknown, meta?: Record<string, unknown>): this {
    return this.log('error', message, { error, ...meta })
  }
}
