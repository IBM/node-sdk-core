'use strict';

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
    const logger = require('../../dist/lib/logger');
    expect(logger).toBeTruthy();
  });

  it('no logger should be enabled', () => {
    const logger = require('../../dist/lib/logger').default;
    expect(logger.warn.enabled).toBe(false);
    expect(logger.verbose.enabled).toBe(false);
    expect(logger.info.enabled).toBe(false);
    expect(logger.error.enabled).toBe(false);
    expect(logger.debug.enabled).toBe(false);
  });

  it('should enable all loggers when axios debug flag is set', () => {
    process.env.NODE_DEBUG = 'axios';
    const logger = require('../../dist/lib/logger').default;
    expect(logger.debug.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should enable all loggers', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core*';
    const logger = require('../../dist/lib/logger').default;
    expect(logger.debug.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should enable debug miniumum scope', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core:debug';
    const logger = require('../../dist/lib/logger').default;
    expect(logger.debug.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should prioritize debug scope', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core:debug,ibm-cloud-sdk-core:verbose';
    const logger = require('../../dist/lib/logger').default;
    expect(logger.debug.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should prioritize verbose scope', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core:error,ibm-cloud-sdk-core:verbose';
    const logger = require('../../dist/lib/logger').default;
    expect(logger.debug.enabled).toBe(false);
    expect(logger.error.enabled).toBe(true);
    expect(logger.info.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should enable error miniumum scope', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core:error';
    const logger = require('../../dist/lib/logger').default;
    expect(logger.error.enabled).toBe(true);
    expect(logger.debug.enabled).toBe(false);
    expect(logger.info.enabled).toBe(false);
    expect(logger.verbose.enabled).toBe(false);
    expect(logger.warn.enabled).toBe(false);
  });

  it('should enable info miniumum scope', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core:info';
    const logger = require('../../dist/lib/logger').default;
    expect(logger.info.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.debug.enabled).toBe(false);
    expect(logger.verbose.enabled).toBe(false);
  });

  it('should enable verbose miniumum scope', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core:verbose';
    const logger = require('../../dist/lib/logger').default;
    expect(logger.verbose.enabled).toBe(true);
    expect(logger.debug.enabled).toBe(false);
    expect(logger.info.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.warn.enabled).toBe(true);
  });

  it('should enable warn miniumum scope', () => {
    process.env.DEBUG = 'ibm-cloud-sdk-core:warning';
    const logger = require('../../dist/lib/logger').default;
    expect(logger.warn.enabled).toBe(true);
    expect(logger.error.enabled).toBe(true);
    expect(logger.verbose.enabled).toBe(false);
    expect(logger.info.enabled).toBe(false);
    expect(logger.debug.enabled).toBe(false);
  });
});
