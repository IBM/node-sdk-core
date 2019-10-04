'use strict';

const logger = require('../../lib/logger').default;
const winston = require('winston');

describe('Logger', () => {
  let env;

  beforeEach(function() {
    jest.resetModules();
    env = process.env;
    process.env = {};
  });
  afterEach(function() {
    process.env = env;
  });

  it('should return an instance of the logger', () => {
    expect(logger).toBeTruthy();
  });

  it('should disable logger by default', () => {
    const newLogger = require('../../lib/logger').default;
    expect(newLogger.silent).toEqual(true);
  });

  it('should enable logger by adding console transport', () => {
    process.env.LOG_TO_CONSOLE = 'true';
    const newLogger = require('../../lib/logger').default;

    expect(newLogger.silent).toEqual(false);
  });

  it('should enable logger by adding file transport', () => {
    process.env.LOG_FILE_NAME = './logs/node-sdk-core.log';
    const newLogger = require('../../lib/logger').default;

    expect(newLogger.silent).toEqual(false);
  });

  it('should enable logger by adding rotating file transport', () => {
    process.env.ENABLE_ROTATING_FILE = 'true';
    const newLogger = require('../../lib/logger').default;

    expect(newLogger.silent).toEqual(false);
  });

  it('should set log level to warn', () => {
    process.env.LOG_LEVEL = 'warn';

    const newLogger = require('../../lib/logger').default;

    expect(newLogger.level).toEqual('warn');
  });
});

describe('Logger Output', () => {
  let env;

  beforeEach(function() {
    jest.resetModules();
    env = process.env;
    process.env = {};
  });
  afterEach(function() {
    process.env = env;
  });

  it('should log warning', () => {
    process.env.LOG_TO_CONSOLE = true;
    const newLogger = require('../../lib/logger').default;

    jest.spyOn(newLogger, 'warn').mockImplementation(() => {});
    newLogger.warn('Log a warning');
    expect(newLogger.warn).toHaveBeenCalled();
    expect(newLogger.warn.mock.calls[0][0]).toBe('Log a warning');
  });

  it('should log error', () => {
    process.env.LOG_TO_CONSOLE = true;
    const newLogger = require('../../lib/logger').default;

    jest.spyOn(newLogger, 'error').mockImplementation(() => {});
    newLogger.error('Log an error');
    expect(newLogger.error).toHaveBeenCalled();
    expect(newLogger.error.mock.calls[0][0]).toBe('Log an error');
  });
});

describe('Logger Transports', () => {
  let env;

  beforeEach(function() {
    jest.resetModules();
    env = process.env;
    process.env = {};
    process.env.LOG_FILE_NAME = './logs/node-sdk-core.log';
  });

  afterEach(function() {
    process.env = env;
  });

  it('should enable console transport', () => {
    process.env.LOG_TO_CONSOLE = 'true';

    const newLogger = require('../../lib/logger').default;
    const consoleTransport = newLogger.transports.find(transport => {
      return transport.name === 'console';
    });

    expect(consoleTransport).toBeDefined();
  });

  it('should enable DailyRotateFile transport & remove file transport', () => {
    process.env.ENABLE_ROTATING_FILE = 'true';

    const newLogger = require('../../lib/logger').default;
    const rotateTransport = newLogger.transports.find(transport => {
      return transport.name === 'dailyRotateFile';
    });
    const fileTransport = newLogger.transports.find(transport => {
      return transport.name === 'file';
    });

    expect(fileTransport).toBeUndefined();
    expect(rotateTransport).toBeDefined();
  });

  it('should enable DailyRotateFile & enable console transport', () => {
    process.env.ENABLE_ROTATING_FILE = 'true';
    process.env.LOG_TO_CONSOLE = 'true';

    const newLogger = require('../../lib/logger').default;
    const rotateTransport = newLogger.transports.find(transport => {
      return transport.name === 'dailyRotateFile';
    });
    const consoleTransport = newLogger.transports.find(transport => {
      return transport.name === 'console';
    });

    expect(consoleTransport).toBeDefined();
    expect(rotateTransport).toBeDefined();
  });

  it('should enable DailyRotateFile, enable console, & disable file transport', () => {
    process.env.ENABLE_ROTATING_FILE = 'true';
    process.env.LOG_TO_CONSOLE = 'true';

    const newLogger = require('../../lib/logger').default;
    const rotateTransport = newLogger.transports.find(transport => {
      return transport.name === 'dailyRotateFile';
    });
    const consoleTransport = newLogger.transports.find(transport => {
      return transport.name === 'console';
    });
    const fileTransport = newLogger.transports.find(transport => {
      return transport.name === 'file';
    });

    expect(consoleTransport).toBeDefined();
    expect(rotateTransport).toBeDefined();
    expect(fileTransport).toBeUndefined();
  });

  it('should enable console & disable silent flag', () => {
    process.env.LOG_TO_CONSOLE = 'true';

    const newLogger = require('../../lib/logger').default;
    const consoleTransport = newLogger.transports.find(transport => {
      return transport.name === 'console';
    });

    expect(consoleTransport).toBeDefined();
    expect(newLogger.silent).toEqual(false);
  });

  it('should not enable logger but still set log level', () => {
    process.env = {};
    process.env.LOG_LEVEL = 'warn';

    const newLogger = require('../../lib/logger').default;

    expect(newLogger.level).toEqual('warn');
    expect(newLogger.silent).toEqual(true);
  });
});

/* The following tests were added to eventually support the case where we give the
 user full configuration control over a log instance. Each test is comprised of winston's
 built in methods to configure an instance of a logger. Currently, they are disabled
 but should be re-enabled if we go down this route. */
describe('Reconfigure Logger Instance', () => {
  xit('should reconfigure log level to verbose', () => {
    const newLogger = logger;
    newLogger.configure({
      level: 'verbose',
    });
    const logLevel = newLogger.level;

    expect(logLevel).toEqual('verbose');
  });

  xit('should reconfigure log file name', () => {
    const newLogger = logger;
    newLogger.clear();
    newLogger.configure({
      transports: [new winston.transports.File({ filename: 'combined.log' })],
    });

    const fileTransport = newLogger.transports.find(transport => {
      return transport.name === 'file';
    });
    expect(fileTransport.filename).toEqual('combined.log');
  });
  xit('should remove console transport', () => {
    const newLogger = logger;
    const consoleTransport = newLogger.transports.find(transport => {
      return transport.name === 'console';
    });

    newLogger.remove(consoleTransport);

    const removedTransport = newLogger.transports.find(transport => {
      return transport.name === 'console';
    });

    expect(removedTransport).toBeUndefined();
  });

  xit('should remove DailyRotateFile transport', () => {
    const newLogger = logger;
    const rotateTransport = newLogger.transports.find(transport => {
      return transport.name === 'dailyRotateFile';
    });

    newLogger.remove(rotateTransport);

    const removedTransport = newLogger.transports.find(transport => {
      return transport.name === 'dailyRotateFile';
    });

    expect(removedTransport).toBeUndefined();
  });

  xit('should clear all transports', () => {
    const newLogger = logger;
    newLogger.clear();
    const transports = newLogger.transports;

    expect(transports.length).toEqual(0);
  });
});
