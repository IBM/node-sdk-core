/**
 * (C) Copyright IBM Corp. 2019, 2021.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const MockSerDeService = require('../resources/mockSerDeService');

// create a mock for the read-external-sources module
const readExternalSourcesModule = require('../../dist/auth/utils/read-external-sources');

readExternalSourcesModule.readExternalSources = jest.fn();
const readExternalSourcesMock = readExternalSourcesModule.readExternalSources;

// mock the request wrapper
const requestWrapperLocation = '../../dist/lib/request-wrapper';
jest.mock(requestWrapperLocation);
const { RequestWrapper } = require(requestWrapperLocation);
const sendRequestMock = jest.fn();
const getHttpClientMock = jest.fn().mockImplementation(() => 'axios');
const setCompressRequestDataMock = jest.fn();
const enableRetriesMock = jest.fn();
const disableRetriesMock = jest.fn();

RequestWrapper.mockImplementation(() => ({
  sendRequest: sendRequestMock,
  getHttpClient: getHttpClientMock,
  setCompressRequestData: setCompressRequestDataMock,
  enableRetries: enableRetriesMock,
  disableRetries: disableRetriesMock,
}));

// mock the authenticator
const noAuthLocation = '../../dist/auth/authenticators/no-auth-authenticator';
jest.mock(noAuthLocation);
const { NoAuthAuthenticator } = require(noAuthLocation);

// nock interferes with other tests in base-service.test.js, so this file serializer/deserializer
// tests are in this separate file.
// eslint-disable-next-line import/order
const nock = require('nock');

const authenticateMock = jest.fn();

NoAuthAuthenticator.mockImplementation(() => ({
  authenticate: authenticateMock,
}));

const DEFAULT_URL = 'https://gateway.watsonplatform.net/test/api';
const AUTHENTICATOR = new NoAuthAuthenticator();
const EMPTY_OBJECT = {}; // careful that nothing is ever added to this object

// mocks need to happen before this is imported
const { BaseService } = require('../../dist/lib/base-service');

describe('Serializer/Deserializer - Tests', () => {
  describe('Serializer/Deserializer - Integration Tests', () => {
    // setup
    beforeEach(() => {
      // set default mocks, these may be overridden in the individual tests
      readExternalSourcesMock.mockImplementation(() => EMPTY_OBJECT);
      authenticateMock.mockImplementation(() => Promise.resolve(null));
    });

    afterEach(() => {
      // clear and the metadata attached to the mocks
      sendRequestMock.mockClear();
      getHttpClientMock.mockClear();
      RequestWrapper.mockClear();
      setCompressRequestDataMock.mockClear();
      enableRetriesMock.mockClear();
      disableRetriesMock.mockClear();
      // also, reset the implementation of the readExternalSourcesMock
      readExternalSourcesMock.mockReset();
      authenticateMock.mockReset();
    });
    it.each(MockSerDeService.dataSet)(
      'test serialization/deserialization $operation',
      async (mock) => {
        nock(DEFAULT_URL)[mock.method](mock.url).reply(200, mock.mockedResponse);
        const testService = new MockSerDeService({
          authenticator: AUTHENTICATOR,
          serviceUrl: DEFAULT_URL,
        });
        const response = await testService[mock.operation](mock.requestParams);
        expect(response.result).toEqual(mock.expectedResponse);
      }
    );
  });
  describe('Serializer/Deserializer - Unit Tests', () => {
    describe('On schemas', () => {
      it('modelSchema should equal serializedModelSchema after calling serialize on it', () => {
        expect(MockSerDeService.ModelSchema.serialize(MockSerDeService.modelSchema)).toEqual(
          MockSerDeService.serializedModelSchema
        );
        expect(
          BaseService.convertModel(
            MockSerDeService.modelSchema,
            MockSerDeService.ModelSchema.serialize
          )
        ).toEqual(MockSerDeService.serializedModelSchema);
      });
      it('serializedModelSchema should equal modelSchema after calling deserialize on it', () => {
        expect(
          MockSerDeService.ModelSchema.deserialize(MockSerDeService.serializedModelSchema)
        ).toEqual(MockSerDeService.modelSchema);
        expect(
          BaseService.convertModel(
            MockSerDeService.serializedModelSchema,
            MockSerDeService.ModelSchema.deserialize
          )
        ).toEqual(MockSerDeService.modelSchema);
      });
      it('nestedModelSchema should equal serializedNestedModelSchema after calling serialize on it', () => {
        expect(
          MockSerDeService.NestedModelSchema.serialize(MockSerDeService.nestedModelSchema)
        ).toEqual(MockSerDeService.serializedNestedModelSchema);
        expect(
          BaseService.convertModel(
            MockSerDeService.nestedModelSchema,
            MockSerDeService.NestedModelSchema.serialize
          )
        ).toEqual(MockSerDeService.serializedNestedModelSchema);
      });
      it('serializedNestedModelSchema should equal nestedModelSchema after calling deserialize on it', () => {
        expect(
          MockSerDeService.NestedModelSchema.deserialize(
            MockSerDeService.serializedNestedModelSchema
          )
        ).toEqual(MockSerDeService.nestedModelSchema);
        expect(
          BaseService.convertModel(
            MockSerDeService.serializedNestedModelSchema,
            MockSerDeService.NestedModelSchema.deserialize
          )
        ).toEqual(MockSerDeService.nestedModelSchema);
      });
    });
    describe('On lists', () => {
      it('modelSchema as a list member should equal serializedModelSchema as a list member after calling serialize on it', () => {
        expect(
          BaseService.convertModel(
            [MockSerDeService.modelSchema],
            MockSerDeService.ModelSchema.serialize
          )
        ).toEqual([MockSerDeService.serializedModelSchema]);
      });
      it('serializedModelSchema as a list member should equal modelSchema as a list member after calling deserialize on it', () => {
        expect(
          BaseService.convertModel(
            [MockSerDeService.serializedModelSchema],
            MockSerDeService.ModelSchema.deserialize
          )
        ).toEqual([MockSerDeService.modelSchema]);
      });
      it('nestedModelSchema as a list member should equal serializedNestedModelSchema as a list member after calling serialize on it', () => {
        expect(
          BaseService.convertModel(
            [MockSerDeService.nestedModelSchema],
            MockSerDeService.NestedModelSchema.serialize
          )
        ).toEqual([MockSerDeService.serializedNestedModelSchema]);
      });
      it('serializedNestedModelSchema as a list member should equal nestedModelSchema as a list member after calling deserialize on it', () => {
        expect(
          BaseService.convertModel(
            [MockSerDeService.serializedNestedModelSchema],
            MockSerDeService.NestedModelSchema.deserialize
          )
        ).toEqual([MockSerDeService.nestedModelSchema]);
      });
    });
    describe('On maps', () => {
      it('modelSchema as a map member should equal serializedModelSchema as a map member after calling serialize on it', () => {
        expect(
          BaseService.convertModel(
            { key: MockSerDeService.modelSchema },
            MockSerDeService.ModelSchema.serialize,
            true
          )
        ).toEqual({ key: MockSerDeService.serializedModelSchema });
      });
      it('serializedModelSchema as a map member should equal modelSchema as a map member after calling deserialize on it', () => {
        expect(
          BaseService.convertModel(
            { key: MockSerDeService.serializedModelSchema },
            MockSerDeService.ModelSchema.deserialize,
            true
          )
        ).toEqual({ key: MockSerDeService.modelSchema });
      });
      it('nestedModelSchema as a map member should equal serializedNestedModelSchema as a map member after calling serialize on it', () => {
        expect(
          BaseService.convertModel(
            { key: MockSerDeService.nestedModelSchema },
            MockSerDeService.NestedModelSchema.serialize,
            true
          )
        ).toEqual({ key: MockSerDeService.serializedNestedModelSchema });
      });
      it('serializedNestedModelSchema as a map member should equal nestedModelSchema as a map member after calling deserialize on it', () => {
        expect(
          BaseService.convertModel(
            { key: MockSerDeService.serializedNestedModelSchema },
            MockSerDeService.NestedModelSchema.deserialize,
            true
          )
        ).toEqual({ key: MockSerDeService.nestedModelSchema });
      });
    });
    describe('On list of maps', () => {
      it('modelSchema as a list of maps member should equal serializedModelSchema as a list of maps after calling serialize on it', () => {
        expect(
          BaseService.convertModel(
            [{ key: MockSerDeService.modelSchema }],
            MockSerDeService.ModelSchema.serialize,
            true
          )
        ).toEqual([{ key: MockSerDeService.serializedModelSchema }]);
      });
      it('serializedModelSchema as a list of maps member should equal modelSchema as a list of maps after calling deserialize on it', () => {
        expect(
          BaseService.convertModel(
            [{ key: MockSerDeService.serializedModelSchema }],
            MockSerDeService.ModelSchema.deserialize,
            true
          )
        ).toEqual([{ key: MockSerDeService.modelSchema }]);
      });
      it('nestedModelSchema as a list of maps member should equal serializedNestedModelSchema as a list of maps after calling serialize on it', () => {
        expect(
          BaseService.convertModel(
            [{ key: MockSerDeService.nestedModelSchema }],
            MockSerDeService.NestedModelSchema.serialize,
            true
          )
        ).toEqual([{ key: MockSerDeService.serializedNestedModelSchema }]);
      });
      it('serializedNestedModelSchema as a list of maps member should equal nestedModelSchema as a list of maps after calling deserialize on it', () => {
        expect(
          BaseService.convertModel(
            [{ key: MockSerDeService.serializedNestedModelSchema }],
            MockSerDeService.NestedModelSchema.deserialize,
            true
          )
        ).toEqual([{ key: MockSerDeService.nestedModelSchema }]);
      });
    });
    describe('On map of lists', () => {
      it('modelSchema as a map of lists member should equal serializedModelSchema as a map of lists after calling serialize on it', () => {
        expect(
          BaseService.convertModel(
            { key: [MockSerDeService.modelSchema] },
            MockSerDeService.ModelSchema.serialize,
            true
          )
        ).toEqual({ key: [MockSerDeService.serializedModelSchema] });
      });
      it('serializedModelSchema as a map of lists member should equal modelSchema as a map of lists after calling deserialize on it', () => {
        expect(
          BaseService.convertModel(
            { key: [MockSerDeService.serializedModelSchema] },
            MockSerDeService.ModelSchema.deserialize,
            true
          )
        ).toEqual({ key: [MockSerDeService.modelSchema] });
      });
      it('nestedModelSchema as a map of lists member should equal serializedNestedModelSchema as a map of lists after calling serialize on it', () => {
        expect(
          BaseService.convertModel(
            { key: [MockSerDeService.nestedModelSchema] },
            MockSerDeService.NestedModelSchema.serialize,
            true
          )
        ).toEqual({ key: [MockSerDeService.serializedNestedModelSchema] });
      });
      it('serializedNestedModelSchema as a map of lists member should equal nestedModelSchema as a map of lists after calling deserialize on it', () => {
        expect(
          BaseService.convertModel(
            { key: [MockSerDeService.serializedNestedModelSchema] },
            MockSerDeService.NestedModelSchema.deserialize,
            true
          )
        ).toEqual({ key: [MockSerDeService.nestedModelSchema] });
      });
    });
  });
});
