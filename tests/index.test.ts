import mockdate from 'mockdate'
import { Logger } from '../src'

mockdate.set('2022-01-01T00:00:00.000Z')

beforeEach(() => {
  jest.spyOn(console, 'info').mockImplementation(() => undefined)
  jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  jest.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe('addMeta', () => {
  it('should add meta', () => {
    const logger = new Logger({}, {})
    logger.addMeta({ prop: 'value' })
    expect(logger['meta1']).toEqual({ prop: 'value' })
  })
})

describe('setParser', () => {
  it('should set parser', () => {
    const parser = jest.fn()
    const logger = new Logger({}, {})
    logger.setParser('toto', parser)
    expect(logger['parsers']['toto']).toBe(parser)
  })
})

describe('action', () => {
  it('should log info for action meta', () => {
    const logger = new Logger({}, {})
    logger['info'] = jest.fn()
    logger.action('app_start', { prop: 'value' })
    expect(logger.info).toHaveBeenCalledWith('app_start', {
      actionId: expect.any(String),
      prop: 'value',
    })
  })

  it('should return action', () => {
    const logger = new Logger({}, {})
    const result = logger.action('app_start', { prop: 'value' })
    expect(result).toEqual({
      success: expect.any(Function),
      failure: expect.any(Function),
    })
  })

  it('should log success', () => {
    const logger = new Logger({}, {})
    logger['info'] = jest.fn()
    const actions = logger.action('app_start', { prop: 'value' })
    actions.success({ prop2: 'value2' })
    expect(logger.info).toHaveBeenCalledWith('app_start_success', {
      actionId: expect.any(String),
      prop: 'value',
      prop2: 'value2',
    })
  })

  it('should log failure', () => {
    const logger = new Logger({}, {})
    logger['error'] = jest.fn()
    const actions = logger.action('app_start', { prop: 'value' })
    actions.failure(new Error('500'), { prop2: 'value2' })
    expect(logger.error).toHaveBeenCalledWith('app_start_failure', {
      actionId: expect.any(String),
      error: new Error('500'),
      prop: 'value',
      prop2: 'value2',
    })
  })
})

describe('log', () => {
  it('should do nothing if silent', () => {
    const logger = new Logger({ silent: true }, {})
    logger.addMeta({ prop1: 'value1' })
    logger['log']('info', 'app_start')
    expect(console.info).not.toHaveBeenCalled()
  })

  it('should log info message without meta', () => {
    const logger = new Logger({}, {})
    logger.addMeta({ prop1: 'value1' })
    logger['log']('info', 'app_start')
    expect(console.info).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'info',
        message: 'app_start',
        prop1: 'value1',
      })
    )
  })

  it('should log info message and meta', () => {
    const logger = new Logger({}, {})
    logger.addMeta({ prop1: 'value1' })
    logger['log']('info', 'app_start', { prop2: 'value2' })
    expect(console.info).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'info',
        message: 'app_start',
        prop1: 'value1',
        prop2: 'value2',
      })
    )
  })

  it('should log warn message and meta', () => {
    const logger = new Logger({}, {})
    logger.addMeta({ prop1: 'value1' })
    logger['log']('warn', 'app_start', { prop2: 'value2' })
    expect(console.warn).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'warn',
        message: 'app_start',
        prop1: 'value1',
        prop2: 'value2',
      })
    )
  })

  it('should log error message and meta', () => {
    const logger = new Logger({}, {})
    logger.addMeta({ prop1: 'value1' })
    logger['log']('error', 'app_start', { prop2: 'value2' })
    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'error',
        message: 'app_start',
        prop1: 'value1',
        prop2: 'value2',
      })
    )
  })
})

describe('info', () => {
  it('should log message and meta', () => {
    const logger = new Logger({}, {})
    logger.addMeta({ prop1: 'value1' })
    logger.info('app_start', { prop2: 'value2' })
    expect(console.info).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'info',
        message: 'app_start',
        prop1: 'value1',
        prop2: 'value2',
      })
    )
  })
})

describe('warn', () => {
  it('should log message and meta', () => {
    const logger = new Logger({}, {})
    logger.addMeta({ prop1: 'value1' })
    logger.warn('app_start', { prop2: 'value2' })
    expect(console.warn).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'warn',
        message: 'app_start',
        prop1: 'value1',
        prop2: 'value2',
      })
    )
  })
})

describe('error', () => {
  it('should log message and meta', () => {
    const logger = new Logger({}, {})
    logger.addMeta({ prop1: 'value1' })
    logger.error('app_start', { prop2: 'value2' })
    expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2022-01-01T00:00:00.000Z',
        level: 'error',
        message: 'app_start',
        prop1: 'value1',
        prop2: 'value2',
      })
    )
  })
})
