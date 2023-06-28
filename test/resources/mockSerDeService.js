/* eslint-disable no-use-before-define,object-shorthand */
// eslint-disable-next-line max-classes-per-file
const extend = require('extend');
const { BaseService } = require('../../dist/lib/base-service');

// eslint-disable-next-line import/prefer-default-export
class MockSerDeService extends BaseService {
  // eslint-disable-next-line no-useless-constructor
  constructor(options) {
    super(options);
  }

  headNestedModelSchema(params) {
    const parameters = {
      options: {
        url: '/nestedModelSchema',
        method: 'HEAD',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  postAnyType(params) {
    const { body } = params;
    const parameters = {
      options: {
        url: '/anyType',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getAnyType(params) {
    const parameters = {
      options: {
        url: '/anyType',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  postNestedModelSchema(params) {
    const body = NestedModelSchema.serialize(params.nestedModelSchema);
    const parameters = {
      options: {
        url: '/nestedModelSchema',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getNestedModelSchema(params) {
    const parameters = {
      options: {
        url: '/nestedModelSchema',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequestAndDeserializeResponse(parameters, NestedModelSchema.deserialize);
  }

  postMultipartNestedModelSchema(params) {
    const { body } = NestedModelSchema.serialize(params.nestedModelSchema);
    const parameters = {
      options: {
        url: '/multipartNestedModelSchema',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getMultipartNestedModelSchema(params) {
    const parameters = {
      options: {
        url: '/multipartNestedModelSchema',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequestAndDeserializeResponse(parameters, NestedModelSchema.deserialize);
  }

  postModelSchema(params) {
    const body = params;
    const parameters = {
      options: {
        url: '/modelSchema',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getModelSchema(params) {
    const parameters = {
      options: {
        url: '/modelSchema',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequestAndDeserializeResponse(parameters, ModelSchema.deserialize);
  }

  postListOfSchemas(params) {
    const body = BaseService.serializeModel(params.modelSchema, ModelSchema.serialize);
    const parameters = {
      options: {
        url: '/listOfSchemas',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getListOfSchemas(params) {
    const parameters = {
      options: {
        url: '/listOfSchemas',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequestAndDeserializeResponse(parameters, ModelSchema.deserialize);
  }

  postListOfPrimitives(params) {
    const body = { requestBody: [72.5] };
    const parameters = {
      options: {
        url: '/listOfPrimitives',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getListOfPrimitives(params) {
    const parameters = {
      options: {
        url: '/listOfPrimitives',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  postListOfMapsOfSchemas(params) {
    const body = BaseService.serializeModel(params.modelSchema, ModelSchema.serialize);
    const parameters = {
      options: {
        url: '/listOfMapsOfSchemas',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getListOfMapsOfSchemas(params) {
    const parameters = {
      options: {
        url: '/listOfMapsOfSchemas',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequestAndDeserializeResponse(parameters, JsonObject.deserialize);
  }

  postMapOfSchemas(params) {
    const body = BaseService.serializeModel(params.requestBody, ModelSchema.serialize, true);
    const parameters = {
      options: {
        url: '/mapOfSchemas',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getMapOfSchemas(params) {
    const parameters = {
      options: {
        url: '/mapOfSchemas',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequestAndDeserializeResponse(parameters, ModelSchema.deserialize, true);
  }

  postMapOfPrimitives(params) {
    const body = params.requestBody;
    const parameters = {
      options: {
        url: '/mapOfPrimitives',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getMapOfPrimitives(params) {
    const parameters = {
      options: {
        url: '/mapOfPrimitives',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  postMapOfListOfSchemas(params) {
    const body = {
      map_prop: BaseService.serializeModel(params.mapProp, ModelSchema.serialize, true),
    };
    const parameters = {
      options: {
        url: '/mapOfListOfSchemas',
        method: 'POST',
        body,
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequest(parameters);
  }

  getMapOfListOfSchemas(params) {
    const parameters = {
      options: {
        url: '/mapOfListOfSchemas',
        method: 'GET',
      },
      defaultOptions: extend(true, {}, this.baseOptions, {
        headers: extend(true, {}, params.headers),
      }),
    };
    return this.createRequestAndDeserializeResponse(parameters, MapOfListOfSchemas.deserialize);
  }
}

class JsonObject {
  static serialize(obj) {
    return obj;
  }

  static deserialize(obj) {
    return obj;
  }
}

class MapOfListOfSchemas {
  static serialize(obj) {
    if (obj === undefined || obj === null || typeof obj === 'string') {
      return obj;
    }
    const copy = {};
    if (obj.mapProp !== undefined) {
      copy.map_prop = BaseService.serializeModel(obj.mapProp, ModelSchema.serialize);
    }
    return copy;
  }

  static deserialize(obj) {
    if (obj === undefined || obj === null || typeof obj === 'string') {
      return obj;
    }
    const copy = {};
    if (obj.map_prop !== undefined) {
      copy.mapProp = BaseService.serializeModel(obj.map_prop, ModelSchema.deserialize);
    }
    return copy;
  }
}

class ModelSchema {
  static serialize(obj) {
    if (obj === undefined || obj === null || typeof obj === 'string') {
      return obj;
    }
    const copy = {};
    if (obj.numberProp !== undefined) {
      copy.number_prop = obj.numberProp;
    }
    if (obj.numberprop !== undefined) {
      copy.numberprop = obj.numberprop;
    }
    if (obj.stringProp !== undefined) {
      copy.string_prop = obj.stringProp;
    }
    if (obj.stringprop !== undefined) {
      copy.stringprop = obj.stringprop;
    }
    return copy;
  }

  static deserialize(obj) {
    if (obj === undefined || obj === null || typeof obj === 'string') {
      return obj;
    }
    const copy = {};
    if (obj.number_prop !== undefined) {
      copy.numberProp = obj.number_prop;
    }
    if (obj.numberprop !== undefined) {
      copy.numberprop = obj.numberprop;
    }
    if (obj.string_prop !== undefined) {
      copy.stringProp = obj.string_prop;
    }
    if (obj.stringprop !== undefined) {
      copy.stringprop = obj.stringprop;
    }
    return copy;
  }
}

class NestedModelSchema {
  static serialize(obj) {
    if (obj === undefined || obj === null || typeof obj === 'string') {
      return obj;
    }
    const copy = {};
    if (obj.stringProp !== undefined) {
      copy.string_prop = obj.stringProp;
    }
    if (obj.stringprop !== undefined) {
      copy.stringprop = obj.stringprop;
    }
    if (obj.booleanProp !== undefined) {
      copy.boolean_prop = obj.booleanProp;
    }
    if (obj.booleanprop !== undefined) {
      copy.booleanprop = obj.booleanprop;
    }
    if (obj.numberProp !== undefined) {
      copy.number_prop = obj.numberProp;
    }
    if (obj.numberprop !== undefined) {
      copy.numberprop = obj.numberprop;
    }
    if (obj.headers !== undefined) {
      copy.headers = obj.headers;
    }
    if (obj.anyProp1 !== undefined) {
      copy.any_prop1 = obj.anyProp1;
    }
    if (obj.anyprop1 !== undefined) {
      copy.anyprop1 = obj.anyprop1;
    }
    if (obj.anyProp2 !== undefined) {
      copy.any_prop2 = obj.anyProp2;
    }
    if (obj.anyprop2 !== undefined) {
      copy.anyprop2 = obj.anyprop2;
    }
    if (obj.anyObjectProp !== undefined) {
      copy.any_object_prop = obj.anyObjectProp;
    }
    if (obj.anyobjectprop !== undefined) {
      copy.anyobjectprop = obj.anyobjectprop;
    }
    if (obj.schemaProp !== undefined) {
      copy.schema_prop = ModelSchema.serialize(obj.schemaProp);
    }
    if (obj.schemaprop !== undefined) {
      copy.schemaprop = ModelSchema.serialize(obj.schemaprop);
    }
    if (obj.listOfPrimitivesProp !== undefined) {
      copy.list_of_primitives_prop = obj.listOfPrimitivesProp;
    }
    if (obj.listofprimitivesprop !== undefined) {
      copy.listofprimitivesprop = obj.listofprimitivesprop;
    }
    if (obj.listOfSchemasProp !== undefined) {
      copy.list_of_schemas_prop = BaseService.serializeModel(
        obj.listOfSchemasProp,
        ModelSchema.serialize
      );
    }
    if (obj.listofschemasprop !== undefined) {
      copy.listofschemasprop = BaseService.serializeModel(
        obj.listofschemasprop,
        ModelSchema.serialize
      );
    }
    if (obj.mapOfPrimitivesProp !== undefined) {
      copy.map_of_primitives_prop = obj.mapOfPrimitivesProp;
    }
    if (obj.mapofprimitivesprop !== undefined) {
      copy.mapofprimitivesprop = obj.mapofprimitivesprop;
    }
    if (obj.mapOfSchemasProp !== undefined) {
      copy.map_of_schemas_prop = BaseService.serializeModel(
        obj.mapOfSchemasProp,
        ModelSchema.serialize,
        true
      );
    }
    if (obj.mapofschemasprop !== undefined) {
      copy.mapofschemasprop = BaseService.serializeModel(
        obj.mapofschemasprop,
        ModelSchema.serialize,
        true
      );
    }
    const defaultProperties = [
      'stringProp',
      'stringprop',
      'booleanProp',
      'booleanprop',
      'numberProp',
      'numberprop',
      'headers',
      'anyProp1',
      'anyprop1',
      'anyProp2',
      'anyprop2',
      'anyObjectProp',
      'anyobjectprop',
      'schemaProp',
      'schemaprop',
      'listOfPrimitivesProp',
      'listofprimitivesprop',
      'listOfSchemasProp',
      'listofschemasprop',
      'mapOfPrimitivesProp',
      'mapofprimitivesprop',
      'mapOfSchemasProp',
      'mapofschemasprop',
    ];
    Object.keys(obj).forEach((key) => {
      if (!defaultProperties.includes(key)) {
        copy[key] = obj[key];
      }
    });
    return copy;
  }

  static deserialize(obj) {
    if (obj === undefined || obj === null || typeof obj === 'string') {
      return obj;
    }
    const copy = {};
    if (obj.string_prop !== undefined) {
      copy.stringProp = obj.string_prop;
    }
    if (obj.stringprop !== undefined) {
      copy.stringprop = obj.stringprop;
    }
    if (obj.boolean_prop !== undefined) {
      copy.booleanProp = obj.boolean_prop;
    }
    if (obj.booleanprop !== undefined) {
      copy.booleanprop = obj.booleanprop;
    }
    if (obj.number_prop !== undefined) {
      copy.numberProp = obj.number_prop;
    }
    if (obj.numberprop !== undefined) {
      copy.numberprop = obj.numberprop;
    }
    if (obj.headers !== undefined) {
      copy.headers = obj.headers;
    }
    if (obj.any_prop1 !== undefined) {
      copy.anyProp1 = obj.any_prop1;
    }
    if (obj.anyprop1 !== undefined) {
      copy.anyprop1 = obj.anyprop1;
    }
    if (obj.any_prop2 !== undefined) {
      copy.anyProp2 = obj.any_prop2;
    }
    if (obj.anyprop2 !== undefined) {
      copy.anyprop2 = obj.anyprop2;
    }
    if (obj.any_object_prop !== undefined) {
      copy.anyObjectProp = obj.any_object_prop;
    }
    if (obj.anyobjectprop !== undefined) {
      copy.anyobjectprop = obj.anyobjectprop;
    }
    if (obj.schema_prop !== undefined) {
      copy.schemaProp = ModelSchema.deserialize(obj.schema_prop);
    }
    if (obj.schemaprop !== undefined) {
      copy.schemaprop = ModelSchema.deserialize(obj.schemaprop);
    }
    if (obj.list_of_primitives_prop !== undefined) {
      copy.listOfPrimitivesProp = obj.list_of_primitives_prop;
    }
    if (obj.listofprimitivesprop !== undefined) {
      copy.listofprimitivesprop = obj.listofprimitivesprop;
    }
    if (obj.list_of_schemas_prop !== undefined) {
      copy.listOfSchemasProp = BaseService.serializeModel(
        obj.list_of_schemas_prop,
        ModelSchema.deserialize
      );
    }
    if (obj.listofschemasprop !== undefined) {
      copy.listofschemasprop = BaseService.serializeModel(
        obj.listofschemasprop,
        ModelSchema.deserialize
      );
    }
    if (obj.map_of_primitives_prop !== undefined) {
      copy.mapOfPrimitivesProp = obj.map_of_primitives_prop;
    }
    if (obj.mapofprimitivesprop !== undefined) {
      copy.mapofprimitivesprop = obj.mapofprimitivesprop;
    }
    if (obj.map_of_schemas_prop !== undefined) {
      copy.mapOfSchemasProp = BaseService.serializeModel(
        obj.map_of_schemas_prop,
        ModelSchema.deserialize,
        true
      );
    }
    if (obj.mapofschemasprop !== undefined) {
      copy.mapofschemasprop = BaseService.serializeModel(
        obj.mapofschemasprop,
        ModelSchema.deserialize,
        true
      );
    }
    const defaultProperties = [
      'string_prop',
      'stringprop',
      'boolean_prop',
      'booleanprop',
      'number_prop',
      'numberprop',
      'headers',
      'any_prop1',
      'anyprop1',
      'any_prop2',
      'anyprop2',
      'any_object_prop',
      'anyobjectprop',
      'schema_prop',
      'schemaprop',
      'list_of_primitives_prop',
      'listofprimitivesprop',
      'list_of_schemas_prop',
      'listofschemasprop',
      'map_of_primitives_prop',
      'mapofprimitivesprop',
      'map_of_schemas_prop',
      'mapofschemasprop',
    ];
    Object.keys(obj).forEach((key) => {
      if (!defaultProperties.includes(key)) {
        copy[key] = obj[key];
      }
    });
    return copy;
  }
}

// ModelSchema
const modelSchema = {
  numberProp: 72.5,
  numberprop: 72.5,
  stringProp: 'testString',
  stringprop: 'testString',
};

const serializedModelSchema = {
  number_prop: modelSchema.numberProp,
  numberprop: modelSchema.numberprop,
  string_prop: modelSchema.stringProp,
  stringprop: modelSchema.stringprop,
};

// NestedModelSchema
const nestedModelSchema = {
  stringProp: 'testString',
  stringprop: 'testString',
  booleanProp: true,
  booleanprop: true,
  numberProp: 72.5,
  numberprop: 72.5,
  headers: 'testString',
  anyProp1: 'testString',
  anyprop1: 'testString',
  anyProp2: 'testString',
  anyprop2: 'testString',
  anyObjectProp: { any_key: 'anyValue' },
  anyobjectprop: { any_key: 'anyValue' },
  schemaProp: modelSchema,
  schemaprop: modelSchema,
  listOfPrimitivesProp: [72.5],
  listofprimitivesprop: [72.5],
  listOfSchemasProp: [modelSchema],
  listofschemasprop: [modelSchema],
  mapOfPrimitivesProp: { key1: 'testString' },
  mapofprimitivesprop: { key1: 'testString' },
  mapOfSchemasProp: { key1: modelSchema },
  mapofschemasprop: { key1: modelSchema },
  foo: 'testString',
};

const serializedNestedModelSchema = {
  string_prop: nestedModelSchema.stringProp,
  stringprop: nestedModelSchema.stringprop,
  boolean_prop: nestedModelSchema.booleanProp,
  booleanprop: nestedModelSchema.booleanprop,
  number_prop: nestedModelSchema.numberProp,
  numberprop: nestedModelSchema.numberprop,
  headers: nestedModelSchema.headers,
  any_prop1: nestedModelSchema.anyProp1,
  anyprop1: nestedModelSchema.anyprop1,
  any_prop2: nestedModelSchema.anyProp2,
  anyprop2: nestedModelSchema.anyprop2,
  any_object_prop: { any_key: nestedModelSchema.anyObjectProp.any_key },
  anyobjectprop: { any_key: nestedModelSchema.anyobjectprop.any_key },
  schema_prop: serializedModelSchema,
  schemaprop: serializedModelSchema,
  list_of_primitives_prop: nestedModelSchema.listOfPrimitivesProp,
  listofprimitivesprop: nestedModelSchema.listofprimitivesprop,
  list_of_schemas_prop: [serializedModelSchema],
  listofschemasprop: [serializedModelSchema],
  map_of_primitives_prop: nestedModelSchema.mapOfPrimitivesProp,
  mapofprimitivesprop: nestedModelSchema.mapofprimitivesprop,
  map_of_schemas_prop: { key1: serializedModelSchema },
  mapofschemasprop: { key1: serializedModelSchema },
  foo: 'testString',
};

const dataSet = [
  {
    operation: 'headNestedModelSchema',
    method: 'head',
    url: '/nestedModelSchema',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: {},
  },
  {
    operation: 'postAnyType',
    method: 'post',
    url: '/anyType',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: { body: 'any' },
  },
  {
    operation: 'getAnyType',
    method: 'get',
    url: '/anyType',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: {},
  },
  {
    operation: 'postNestedModelSchema',
    url: '/nestedModelSchema',
    method: 'post',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: { nestedModelSchema },
  },
  {
    operation: 'getNestedModelSchema',
    method: 'get',
    url: '/nestedModelSchema',
    mockedResponse: serializedNestedModelSchema,
    expectedResponse: nestedModelSchema,
    requestParams: {},
  },
  {
    operation: 'postMultipartNestedModelSchema',
    method: 'post',
    url: '/multipartNestedModelSchema',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: { nestedModelSchema },
  },
  {
    operation: 'getMultipartNestedModelSchema',
    method: 'get',
    url: '/multipartNestedModelSchema',
    mockedResponse: serializedNestedModelSchema,
    expectedResponse: nestedModelSchema,
    requestParams: {},
  },
  {
    operation: 'postModelSchema',
    method: 'post',
    url: '/modelSchema',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: modelSchema,
  },
  {
    operation: 'getModelSchema',
    method: 'get',
    url: '/modelSchema',
    mockedResponse: serializedModelSchema,
    expectedResponse: modelSchema,
    requestParams: {},
  },
  {
    operation: 'postListOfSchemas',
    method: 'post',
    url: '/listOfSchemas',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: { modelSchema: [modelSchema] },
  },
  {
    operation: 'getListOfSchemas',
    method: 'get',
    url: '/listOfSchemas',
    mockedResponse: [serializedModelSchema],
    expectedResponse: [modelSchema],
    requestParams: {},
  },
  {
    operation: 'postListOfPrimitives',
    method: 'post',
    url: '/listOfPrimitives',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: { requestBody: [72.5] },
  },
  {
    operation: 'getListOfPrimitives',
    method: 'get',
    url: '/listOfPrimitives',
    mockedResponse: [72.5],
    expectedResponse: [72.5],
    requestParams: {},
  },
  {
    operation: 'postListOfMapsOfSchemas',
    method: 'post',
    url: '/listOfMapsOfSchemas',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: { modelSchema: [{ key1: modelSchema }] },
  },
  {
    operation: 'getListOfMapsOfSchemas',
    method: 'get',
    url: '/listOfMapsOfSchemas',
    mockedResponse: [{ key1: modelSchema }],
    expectedResponse: [{ key1: modelSchema }],
    requestParams: {},
  },
  {
    operation: 'postMapOfSchemas',
    method: 'post',
    url: '/mapOfSchemas',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: { requestBody: { key1: modelSchema } },
  },
  {
    operation: 'getMapOfSchemas',
    method: 'get',
    url: '/mapOfSchemas',
    mockedResponse: { key1: serializedModelSchema },
    expectedResponse: { key1: modelSchema },
    requestParams: {},
  },
  {
    operation: 'postMapOfPrimitives',
    method: 'post',
    url: '/mapOfPrimitives',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: { requestBody: { key1: 'testString' } },
  },
  {
    operation: 'getMapOfPrimitives',
    method: 'get',
    url: '/mapOfPrimitives',
    mockedResponse: { key1: 'testString' },
    expectedResponse: { key1: 'testString' },
    requestParams: {},
  },
  {
    operation: 'postMapOfListOfSchemas',
    method: 'post',
    url: '/mapOfListOfSchemas',
    mockedResponse: {},
    expectedResponse: {},
    requestParams: { mapProp: [modelSchema] },
  },
  {
    operation: 'getMapOfListOfSchemas',
    method: 'get',
    url: '/mapOfListOfSchemas',
    mockedResponse: { map_prop: [serializedModelSchema] },
    expectedResponse: { mapProp: [modelSchema] },
    requestParams: {},
  },
];

MockSerDeService.dataSet = dataSet;
MockSerDeService.JsonObject = JsonObject;
MockSerDeService.MapOfListOfSchemas = MapOfListOfSchemas;
MockSerDeService.ModelSchema = ModelSchema;
MockSerDeService.NestedModelSchema = NestedModelSchema;
MockSerDeService.modelSchema = modelSchema;
MockSerDeService.serializedModelSchema = serializedModelSchema;
MockSerDeService.nestedModelSchema = nestedModelSchema;
MockSerDeService.serializedNestedModelSchema = serializedNestedModelSchema;

module.exports = MockSerDeService;
