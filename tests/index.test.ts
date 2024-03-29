import mockdate from 'mockdate'
import { Logger } from '../src'

mockdate.set('2022-01-01T00:00:00.000Z')

beforeEach(() => {
  jest.spyOn(Buffer.prototype, 'toString').mockReturnValue('random string')
  jest.spyOn(console, 'info').mockImplementation(() => undefined)
  jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe('constructor', () => {
  it('should init logger id', () => {
    const logger = new Logger()
    expect(logger['id']).toBe('random string')
  })

  it('should init logger meta', () => {
    const logger = new Logger({})
    expect(logger['loggerMeta']).toEqual({})
  })

  it('should init logger options', () => {
    const logger = new Logger()
    expect(logger['options']).toEqual({})
  })
})

describe('addMeta', () => {
  it('should not add meta if logger is silent', () => {
    const logger = new Logger({ silent: true })
    logger.addMeta({ prop: 'value' })
    expect(logger['loggerMeta']).toEqual({})
  })

  it('should add meta if logger', () => {
    const logger = new Logger()
    logger.addMeta({ prop: 'value' })
    expect(logger['loggerMeta']).toEqual({ prop: 'value' })
  })
})

describe('start', () => {
  it('should log info for action meta', () => {
    const logger = new Logger()
    logger['info'] = jest.fn()
    logger.start('message', { prop: 'value' })
    expect(logger.info).toHaveBeenCalledWith('message', {
      actionId: expect.any(String),
      prop: 'value',
    })
  })

  it('should return action', () => {
    const logger = new Logger()
    const result = logger.start('message', { prop: 'value' })
    expect(result).toEqual({
      success: expect.any(Function),
      failure: expect.any(Function),
    })
  })

  it('should log success', () => {
    const logger = new Logger()
    logger['info'] = jest.fn()
    const actions = logger.start('message', { prop: 'value' })
    actions.success({ prop2: 'value2' })
    expect(logger.info).toHaveBeenCalledWith('message_success', {
      actionId: expect.any(String),
      prop: 'value',
      prop2: 'value2',
    })
  })

  it('should log failure', () => {
    const logger = new Logger()
    logger['error'] = jest.fn()
    const actions = logger.start('message', { prop: 'value' })
    actions.failure(new Error('500'), { prop2: 'value2' })
    expect(logger.error).toHaveBeenCalledWith('message_failure', new Error('500'), {
      actionId: expect.any(String),
      prop: 'value',
      prop2: 'value2',
    })
  })
})

describe('log', () => {
  it('should do nothing if logger is silent', () => {
    const logger = new Logger({ silent: true })
    logger.addMeta({ prop1: 'value1' })
    logger['log']('info', 'message')
    expect(console.info).not.toHaveBeenCalled()
  })

  it('should log message with meta', () => {
    const logger = new Logger()
    logger.addMeta({ prop1: 'value1' })
    logger['log']('info', 'message', { prop2: 'value2' })
    expect(console.info).toHaveBeenCalledWith(
      JSON.stringify({
        level: 'info',
        timestamp: '2022-01-01T00:00:00.000Z',
        message: 'message',
        trace: { loggerId: 'random string' },
        prop1: 'value1',
        prop2: 'value2',
      })
    )
  })

  it('should log info with colors', () => {
    const logger = new Logger({ colors: true })
    logger['log']('info', 'message')
    expect(console.info).toHaveBeenCalledWith(
      '{"level":"\x1b[32minfo\x1b[0m","timestamp":"2022-01-01T00:00:00.000Z","message":"message","trace":{"loggerId":"random string"}}'
    )
  })

  it('should log warn with colors', () => {
    const logger = new Logger({ colors: true })
    logger['log']('warn', 'message')
    expect(console.warn).toHaveBeenCalledWith(
      '{"level":"\x1b[33mwarn\x1b[0m","timestamp":"2022-01-01T00:00:00.000Z","message":"message","trace":{"loggerId":"random string"}}'
    )
  })

  it('should log error with colors', () => {
    const logger = new Logger({ colors: true })
    logger['log']('error', 'message')
    expect(console.error).toHaveBeenCalledWith(
      '{"level":"\x1b[31merror\x1b[0m","timestamp":"2022-01-01T00:00:00.000Z","message":"message","trace":{"loggerId":"random string"}}'
    )
  })
})

describe('info', () => {
  it('should log message and meta', () => {
    const logger = new Logger()
    logger['log'] = jest.fn()
    logger.info('message', { prop: 'value' })
    expect(logger['log']).toHaveBeenCalledWith('info', 'message', { prop: 'value' })
  })
})

describe('warn', () => {
  it('should log message and meta', () => {
    const logger = new Logger()
    logger['log'] = jest.fn()
    logger.warn('message', { prop: 'value' })
    expect(logger['log']).toHaveBeenCalledWith('warn', 'message', { prop: 'value' })
  })
})

describe('error', () => {
  it('should log message and meta', () => {
    const logger = new Logger()
    logger['log'] = jest.fn()
    logger.error('message', new Error('500'), { prop: 'value' })
    expect(logger['log']).toHaveBeenCalledWith('error', 'message', { error: new Error('500'), prop: 'value' })
  })
})
