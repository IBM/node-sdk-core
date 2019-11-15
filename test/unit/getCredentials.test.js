'use strict';

const fs = require('fs');
const { readExternalSources } = require('../../auth');

describe('getCredentials', () => {

  beforeAll(() => {
    process.env['VCAP_SERVICES'] = fs.readFileSync(__dirname + '/../resources/vcap.json')
  })

  it('should return empty credential object when service key is empty_service', () => {
    const credentials = readExternalSources('empty_service')
    expect(credentials).toBeDefined()
    expect(Object.keys(credentials).length).toEqual(0);
  });

  it('should return empty credential object when looking for credentials by service name', () => {
    const credentials = readExternalSources('discovery2')
    expect(credentials.url).toEqual("https://gateway.watsonplatform2.net/discovery-experimental/api");
    expect(credentials.username).toEqual("not-a-username")
    expect(credentials.password).toEqual("not-a-password")
  });

  it('should return empty credential object when looking for credentials by service name', () => {
    const credentials = readExternalSources('discovery1')
    expect(credentials.url).toEqual("https://gateway.watsonplatform1.net/discovery-experimental/api");
    expect(credentials.username).toEqual("not-a-username")
    expect(credentials.password).toEqual("not-a-password")
  });

  it('should return first service in the list when multiple services found', () => {
    const credentials = readExternalSources('discovery')
    expect(credentials.url).toEqual("https://gateway.watsonplatform1.net/discovery-experimental/api");
    expect(credentials.username).toEqual("not-a-username")
    expect(credentials.password).toEqual("not-a-password")
  });

  it('should return empty credential object when service key is no-creds-service-two', () => {
    const credentials = readExternalSources('no-creds-service-two')
    expect(credentials).toBeDefined()
    expect(Object.keys(credentials).length).toEqual(0);
  });

});
