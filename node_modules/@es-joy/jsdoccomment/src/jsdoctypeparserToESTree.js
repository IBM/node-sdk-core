import esquery from 'esquery';
import toCamelCase from './toCamelCase.js';

const jsdoctypeparserToESTree = (parsedType) => {
  // Todo: See about getting jsdoctypeparser to make these
  //         changes; the AST might also be rethought to use
  //         fewer types and more properties
  const sel = esquery.parse('*[type]');
  esquery.traverse(parsedType, sel, (node) => {
    const {type} = node;

    node.type = `JSDocType${toCamelCase(type)}`;
  });

  return parsedType;
};

const typeVisitorKeys = {
  NAME: [],
  NAMED_PARAMETER: ['typeName'],
  MEMBER: ['owner'],
  UNION: ['left', 'right'],
  INTERSECTION: ['left', 'right'],
  VARIADIC: ['value'],
  RECORD: ['entries'],
  RECORD_ENTRY: ['value'],
  TUPLE: ['entries'],
  GENERIC: ['subject', 'objects'],
  MODULE: ['value'],
  OPTIONAL: ['value'],
  NULLABLE: ['value'],
  NOT_NULLABLE: ['value'],
  FUNCTION: ['params', 'returns', 'this', 'new'],
  ARROW: ['params', 'returns'],
  ANY: [],
  UNKNOWN: [],
  INNER_MEMBER: ['owner'],
  INSTANCE_MEMBER: ['owner'],
  STRING_VALUE: [],
  NUMBER_VALUE: [],
  EXTERNAL: [],
  FILE_PATH: [],
  PARENTHESIS: ['value'],
  TYPE_QUERY: ['name'],
  KEY_QUERY: ['value'],
  IMPORT: ['path']
};

const jsdocTypeVisitorKeys = Object.entries(
  typeVisitorKeys
).reduce((object, [key, value]) => {
  object[`JSDocType${toCamelCase(key)}`] = value;

  return object;
}, {});

export {jsdoctypeparserToESTree, jsdocTypeVisitorKeys};
