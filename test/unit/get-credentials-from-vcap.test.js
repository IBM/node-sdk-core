'use strict';

const fs = require('fs');
const { readExternalSources } = require('../../dist/auth');

describe('getCredentialsFromVcap', () => {
  beforeAll(() => {
    process.env['VCAP_SERVICES'] = fs.readFileSync(__dirname + '/../resources/vcap.json');
  });

  it('should return empty credential object when service key is empty_service', () => {
    const credentials = readExternalSources('empty_service');
    expect(credentials).toBeDefined();
    expect(Object.keys(credentials).length).toEqual(0);
  });

  it('should return credential object matching service name field is not first list element', () => {
    const credentials = readExternalSources('discovery2');
    expect(credentials.url).toEqual(
      'https://gateway.watsonplatform2.net/discovery-experimental/api'
    );
    expect(credentials.username).toEqual('not-a-username');
    expect(credentials.password).toEqual('not-a-password');
  });

  it('should return credential object when matching service name field on first list element', () => {
    const credentials = readExternalSources('discovery1');
    expect(credentials.url).toEqual(
      'https://gateway.watsonplatform1.net/discovery-experimental/api'
    );
    expect(credentials.username).toEqual('not-a-username');
    expect(credentials.password).toEqual('not-a-password');
  });

  it('should return first service in the list matching on primary service key', () => {
    const credentials = readExternalSources('discovery');
    expect(credentials.url).toEqual(
      'https://gateway.watsonplatform1.net/discovery-experimental/api'
    );
    expect(credentials.username).toEqual('not-a-username');
    expect(credentials.password).toEqual('not-a-password');
  });

  it('should return empty credential object when matching on service name with no credentials field', () => {
    const credentials = readExternalSources('no-creds-service-two');
    expect(credentials).toBeDefined();
    expect(Object.keys(credentials).length).toEqual(0);
  });
});
