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

describe('parseMeta', () => {
  it('should return empty object if logger is silent', () => {
    const logger = new Logger({ silent: true })
    const result = logger['parseMeta']({ prop: 'value' })
    expect(result).toEqual({})
  })

  it('should parse empty meta', () => {
    const logger = new Logger({ silent: true })
    const result = logger['parseMeta']()
    expect(result).toEqual({})
  })

  it('should return parsed meta if a parser matches', () => {
    const logger = new Logger()
    logger.setParser('prop', (val) => `parsed ${val}`)
    const result = logger['parseMeta']({ prop: 'value' })
    expect(result).toEqual({ prop: 'parsed value' })
  })

  it('should return meta as is', () => {
    const logger = new Logger()
    const result = logger['parseMeta']({ prop: 'value' })
    expect(result).toEqual({ prop: 'value' })
  })

  it('should inspect meta if meta cannot be stringified', () => {
    const logger = new Logger()
    const prop: Record<string, unknown> = {}
    prop.prop = prop
    const result = logger['parseMeta'](prop)
    expect(result).toEqual({ prop: '<ref *1> { prop: [Circular *1] }' })
  })
})

describe('setParser', () => {
  it('should set parser', () => {
    const parser = jest.fn()
    const logger = new Logger()
    logger.setParser('toto', parser)
    expect(logger['parsers']['toto']).toBe(parser)
  })
})

describe('action', () => {
  it('should log info for action meta', () => {
    const logger = new Logger()
    logger['info'] = jest.fn()
    logger.action('message', { prop: 'value' })
    expect(logger.info).toHaveBeenCalledWith('message', {
      actionId: expect.any(String),
      prop: 'value',
    })
  })

  it('should return action', () => {
    const logger = new Logger()
    const result = logger.action('message', { prop: 'value' })
    expect(result).toEqual({
      success: expect.any(Function),
      failure: expect.any(Function),
    })
  })

  it('should log success', () => {
    const logger = new Logger()
    logger['info'] = jest.fn()
    const actions = logger.action('message', { prop: 'value' })
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
    const actions = logger.action('message', { prop: 'value' })
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
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'info',
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
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: '\x1b[32minfo\x1b[0m',
        message: 'message',
        trace: { loggerId: 'random string' },
      })
    )
  })

  it('should log warn with colors', () => {
    const logger = new Logger({ colors: true })
    logger['log']('warn', 'message')
    expect(console.warn).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: '\x1b[33mwarn\x1b[0m',
        message: 'message',
        trace: { loggerId: 'random string' },
      })
    )
  })

  it('should log error with colors', () => {
    const logger = new Logger({ colors: true })
    logger['log']('error', 'message')
    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: '\x1b[31merror\x1b[0m',
        message: 'message',
        trace: { loggerId: 'random string' },
      })
    )
  })
})

describe('info', () => {
  it('should log message and parsed meta', () => {
    const logger = new Logger()
    logger.setParser('prop', (val) => `parsed ${val}`)
    logger['log'] = jest.fn()
    logger.info('message', { prop: 'value' })
    expect(logger['log']).toHaveBeenCalledWith('info', 'message', { prop: 'parsed value' })
  })
})

describe('warn', () => {
  it('should log message and parsed meta', () => {
    const logger = new Logger()
    logger.setParser('prop', (val) => `parsed ${val}`)
    logger['log'] = jest.fn()
    logger.warn('message', { prop: 'value' })
    expect(logger['log']).toHaveBeenCalledWith('warn', 'message', { prop: 'parsed value' })
  })
})

describe('error', () => {
  it('should log message and parsed meta', () => {
    const logger = new Logger()
    logger.setParser('prop', (val) => `parsed ${val}`)
    logger['log'] = jest.fn()
    logger.error('message', new Error('500'), { prop: 'value' })
    expect(logger['log']).toHaveBeenCalledWith('error', 'message', { error: new Error('500'), prop: 'parsed value' })
  })
})
