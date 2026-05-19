import { randomBytes } from 'node:crypto'

const COLORS = {
  info: '\u001B[32m',
  warn: '\u001B[33m',
  error: '\u001B[31m',
  reset: '\u001B[0m',
}

export interface IAction {
  success(meta?: Record<string, unknown>): Logger
  skip(reason: string, meta?: Record<string, unknown>): Logger
  failure(error: unknown, meta?: Record<string, unknown>): Logger
}

export interface ILoggerOptions {
  silent?: boolean
  colors?: boolean
}

export class Logger {
  private id: string

  public constructor(
    private options: ILoggerOptions = {},
    private loggerMeta: Record<string, unknown> = {},
  ) {
    this.id = randomBytes(8).toString('hex')
  }

  public addMeta(meta: Record<string, unknown>): this {
    if (!this.options.silent) {
      this.loggerMeta = { ...this.loggerMeta, ...meta }
    }
    return this
  }

  public start(message: string, meta?: Record<string, unknown>): IAction {
    const actionId = randomBytes(8).toString('hex')
    const actionMeta = { ...meta, actionId }
    const start = Date.now()
    this.info(message, actionMeta)
    return {
      success: (meta?: Record<string, unknown>) =>
        this.info(`${message}_success`, { duration: Date.now() - start, ...actionMeta, ...meta }),
      skip: (reason: string, meta?: Record<string, unknown>) =>
        this.info(`${message}_skip`, { duration: Date.now() - start, reason, ...actionMeta, ...meta }),
      failure: (error: unknown, meta?: Record<string, unknown>) =>
        this.error(`${message}_failure`, error, { duration: Date.now() - start, ...actionMeta, ...meta }),
    }
  }

  private log(
    level: 'info' | 'warn' | 'error',
    message: string,
    { actionId, ...meta }: Record<string, unknown> = {},
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

  public info(message: string, meta?: Record<string, unknown>): this {
    return this.log('info', message, meta)
  }

  public warn(message: string, meta?: Record<string, unknown>): this {
    return this.log('warn', message, meta)
  }

  public error(message: string, error: unknown, meta?: Record<string, unknown>): this {
    return this.log('error', message, { error, ...meta })
  }
}
