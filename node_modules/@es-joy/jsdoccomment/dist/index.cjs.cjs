'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var esquery = require('esquery');
var jsdoctypeparser = require('jsdoctypeparser');
var descriptionTokenizer = require('comment-parser/lib/parser/tokenizers/description.js');
var util_js = require('comment-parser/lib/util.js');
var commentParser = require('comment-parser');
var nameTokenizer = require('comment-parser/lib/parser/tokenizers/name.js');
var tagTokenizer = require('comment-parser/lib/parser/tokenizers/tag.js');
var typeTokenizer = require('comment-parser/lib/parser/tokenizers/type.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var esquery__default = /*#__PURE__*/_interopDefaultLegacy(esquery);
var descriptionTokenizer__default = /*#__PURE__*/_interopDefaultLegacy(descriptionTokenizer);
var nameTokenizer__default = /*#__PURE__*/_interopDefaultLegacy(nameTokenizer);
var tagTokenizer__default = /*#__PURE__*/_interopDefaultLegacy(tagTokenizer);
var typeTokenizer__default = /*#__PURE__*/_interopDefaultLegacy(typeTokenizer);

const toCamelCase = str => {
  return str.toLowerCase().replace(/^[a-z]/gu, init => {
    return init.toUpperCase();
  }).replace(/_(?<wordInit>[a-z])/gu, (_, n1, o, s, {
    wordInit
  }) => {
    return wordInit.toUpperCase();
  });
};

const jsdoctypeparserToESTree = parsedType => {
  // Todo: See about getting jsdoctypeparser to make these
  //         changes; the AST might also be rethought to use
  //         fewer types and more properties
  const sel = esquery__default['default'].parse('*[type]');
  esquery__default['default'].traverse(parsedType, sel, node => {
    const {
      type
    } = node;
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
const jsdocTypeVisitorKeys = Object.entries(typeVisitorKeys).reduce((object, [key, value]) => {
  object[`JSDocType${toCamelCase(key)}`] = value;
  return object;
}, {});

const stripEncapsulatingBrackets = (container, isArr) => {
  if (isArr) {
    const firstItem = container[0];
    firstItem.rawType = firstItem.rawType.replace(/^\{/u, '');
    const lastItem = container[container.length - 1];
    lastItem.rawType = lastItem.rawType.replace(/\}$/u, '');
    return;
  }

  container.rawType = container.rawType.replace(/^\{/u, '').replace(/\}$/u, '');
};

const commentParserToESTree = (jsdoc, mode) => {
  const {
    tokens: {
      delimiter: delimiterRoot,
      postDelimiter: postDelimiterRoot,
      end: endRoot,
      description: descriptionRoot
    }
  } = jsdoc.source[0];
  const ast = {
    delimiter: delimiterRoot,
    description: descriptionRoot,
    descriptionLines: [],
    // `end` will be overwritten if there are other entries
    end: endRoot,
    postDelimiter: postDelimiterRoot,
    type: 'JSDocBlock'
  };
  const tags = [];
  let lastDescriptionLine;
  let lastTag = null;
  jsdoc.source.slice(1).forEach((info, idx) => {
    const {
      tokens
    } = info;
    const {
      delimiter,
      description,
      postDelimiter,
      start,
      tag,
      end,
      type: rawType
    } = tokens;

    if (tag || end) {
      if (lastDescriptionLine === undefined) {
        lastDescriptionLine = idx;
      } // Clean-up with last tag before end or new tag


      if (lastTag) {
        // Strip out `}` that encapsulates and is not part of
        //   the type
        stripEncapsulatingBrackets(lastTag);
        stripEncapsulatingBrackets(lastTag.typeLines, true); // With even a multiline type now in full, add parsing

        let parsedType = null;

        try {
          parsedType = jsdoctypeparser.parse(lastTag.rawType, {
            mode
          });
        } catch {// Ignore
        }

        lastTag.parsedType = jsdoctypeparserToESTree(parsedType);
      }

      if (end) {
        ast.end = end;
        return;
      }

      const {
        end: ed,
        ...tkns
      } = tokens;
      const tagObj = { ...tkns,
        descriptionLines: [],
        rawType: '',
        type: 'JSDocTag',
        typeLines: []
      };
      tagObj.tag = tagObj.tag.replace(/^@/u, '');
      lastTag = tagObj;
      tags.push(tagObj);
    }

    if (rawType) {
      // Will strip rawType brackets after this tag
      lastTag.typeLines.push({
        delimiter,
        postDelimiter,
        rawType,
        start,
        type: 'JSDocTypeLine'
      });
      lastTag.rawType += rawType;
    }

    if (description) {
      const holder = lastTag || ast;
      holder.descriptionLines.push({
        delimiter,
        description,
        postDelimiter,
        start,
        type: 'JSDocDescriptionLine'
      });
      holder.description += holder.description ? '\n' + description : description;
    }
  });
  ast.lastDescriptionLine = lastDescriptionLine;
  ast.tags = tags;
  return ast;
};

const jsdocVisitorKeys = {
  JSDocBlock: ['tags', 'descriptionLines'],
  JSDocDescriptionLine: [],
  JSDocTypeLine: [],
  JSDocTag: ['descriptionLines', 'typeLines', 'parsedType']
};

/**
 * @callback CommentHandler
 * @param {string} commentSelector
 * @param {Node} jsdoc
 * @returns {boolean}
 */

/**
 * @param {Settings} settings
 * @returns {CommentHandler}
 */

const commentHandler = settings => {
  /**
   * @type {CommentHandler}
   */
  return (commentSelector, jsdoc) => {
    const {
      mode
    } = settings;
    const selector = esquery__default['default'].parse(commentSelector);
    const ast = commentParserToESTree(jsdoc, mode);
    return esquery__default['default'].matches(ast, selector, null, {
      visitorKeys: { ...jsdocTypeVisitorKeys,
        ...jsdocVisitorKeys
      }
    });
  };
};

// Todo: We ideally would use comment-parser's es6 directory, but as the repo

const hasSeeWithLink = spec => {
  return spec.tag === 'see' && /\{@link.+?\}/u.test(spec.source[0].source);
};

const getTokenizers = () => {
  // trim
  return [// Tag
  tagTokenizer__default['default'](), // Type
  spec => {
    if (['default', 'defaultvalue', 'see'].includes(spec.tag)) {
      return spec;
    }

    return typeTokenizer__default['default']()(spec);
  }, // Name
  spec => {
    if (spec.tag === 'template') {
      // const preWS = spec.postTag;
      const remainder = spec.source[0].tokens.description;
      const pos = remainder.search(/(?<![\s,])\s/u);
      const name = pos === -1 ? remainder : remainder.slice(0, pos);
      const extra = remainder.slice(pos + 1);
      let postName = '',
          description = '';

      if (pos > -1) {
        [, postName, description] = extra.match(/(\s*)(.*)/u);
      }

      spec.name = name;
      spec.optional = false;
      const {
        tokens
      } = spec.source[0];
      tokens.name = name;
      tokens.postName = postName;
      tokens.description = description;
      return spec;
    }

    if (['example', 'return', 'returns', 'throws', 'exception', 'access', 'version', 'since', 'license', 'author', 'default', 'defaultvalue', 'variation'].includes(spec.tag) || hasSeeWithLink(spec)) {
      return spec;
    }

    return nameTokenizer__default['default']()(spec);
  }, // Description
  spec => {
    return descriptionTokenizer__default['default'](descriptionTokenizer.getJoiner('preserve'))(spec);
  }];
};
/**
 *
 * @param {PlainObject} commentNode
 * @param {string} indent Whitespace
 * @returns {PlainObject}
 */


const parseComment = (commentNode, indent) => {
  // Preserve JSDoc block start/end indentation.
  return commentParser.parse(`/*${commentNode.value}*/`, {
    // @see https://github.com/yavorskiy/comment-parser/issues/21
    tokenizers: getTokenizers()
  })[0] || util_js.seedBlock({
    source: [{
      number: 0,
      tokens: util_js.seedTokens({
        delimiter: '/**',
        description: '',
        end: '',
        postDelimiter: '',
        start: ''
      })
    }, {
      number: 1,
      tokens: util_js.seedTokens({
        delimiter: '',
        description: '',
        end: '*/',
        postDelimiter: '',
        start: indent + ' '
      })
    }]
  });
};

/**
 * Obtained originally from {@link https://github.com/eslint/eslint/blob/master/lib/util/source-code.js#L313}.
 *
 * @license MIT
 */

/**
 * Checks if the given token is a comment token or not.
 *
 * @param {Token} token - The token to check.
 * @returns {boolean} `true` if the token is a comment token.
 */
const isCommentToken = token => {
  return token.type === 'Line' || token.type === 'Block' || token.type === 'Shebang';
};

const getDecorator = node => {
  var _node$declaration, _node$declaration$dec, _node$decorators, _node$parent, _node$parent$decorato;

  return (node === null || node === void 0 ? void 0 : (_node$declaration = node.declaration) === null || _node$declaration === void 0 ? void 0 : (_node$declaration$dec = _node$declaration.decorators) === null || _node$declaration$dec === void 0 ? void 0 : _node$declaration$dec[0]) || (node === null || node === void 0 ? void 0 : (_node$decorators = node.decorators) === null || _node$decorators === void 0 ? void 0 : _node$decorators[0]) || (node === null || node === void 0 ? void 0 : (_node$parent = node.parent) === null || _node$parent === void 0 ? void 0 : (_node$parent$decorato = _node$parent.decorators) === null || _node$parent$decorato === void 0 ? void 0 : _node$parent$decorato[0]);
};
/**
 * Check to see if its a ES6 export declaration.
 *
 * @param {ASTNode} astNode An AST node.
 * @returns {boolean} whether the given node represents an export declaration.
 * @private
 */


const looksLikeExport = function (astNode) {
  return astNode.type === 'ExportDefaultDeclaration' || astNode.type === 'ExportNamedDeclaration' || astNode.type === 'ExportAllDeclaration' || astNode.type === 'ExportSpecifier';
};

const getTSFunctionComment = function (astNode) {
  const {
    parent
  } = astNode;
  const grandparent = parent.parent;
  const greatGrandparent = grandparent.parent;
  const greatGreatGrandparent = greatGrandparent && greatGrandparent.parent; // istanbul ignore if

  if (parent.type !== 'TSTypeAnnotation') {
    return astNode;
  }

  switch (grandparent.type) {
    case 'ClassProperty':
    case 'TSDeclareFunction':
    case 'TSMethodSignature':
    case 'TSPropertySignature':
      return grandparent;

    case 'ArrowFunctionExpression':
      // istanbul ignore else
      if (greatGrandparent.type === 'VariableDeclarator' // && greatGreatGrandparent.parent.type === 'VariableDeclaration'
      ) {
          return greatGreatGrandparent.parent;
        } // istanbul ignore next


      return astNode;

    case 'FunctionExpression':
      // istanbul ignore else
      if (greatGrandparent.type === 'MethodDefinition') {
        return greatGrandparent;
      }

    // Fallthrough

    default:
      // istanbul ignore if
      if (grandparent.type !== 'Identifier') {
        // istanbul ignore next
        return astNode;
      }

  } // istanbul ignore next


  switch (greatGrandparent.type) {
    case 'ArrowFunctionExpression':
      // istanbul ignore else
      if (greatGreatGrandparent.type === 'VariableDeclarator' && greatGreatGrandparent.parent.type === 'VariableDeclaration') {
        return greatGreatGrandparent.parent;
      } // istanbul ignore next


      return astNode;

    case 'FunctionDeclaration':
      return greatGrandparent;

    case 'VariableDeclarator':
      // istanbul ignore else
      if (greatGreatGrandparent.type === 'VariableDeclaration') {
        return greatGreatGrandparent;
      }

    // Fallthrough

    default:
      // istanbul ignore next
      return astNode;
  }
};

const invokedExpression = new Set(['CallExpression', 'OptionalCallExpression', 'NewExpression']);
const allowableCommentNode = new Set(['VariableDeclaration', 'ExpressionStatement', 'MethodDefinition', 'Property', 'ObjectProperty', 'ClassProperty']);
/**
 * Reduces the provided node to the appropriate node for evaluating
 * JSDoc comment status.
 *
 * @param {ASTNode} node An AST node.
 * @param {SourceCode} sourceCode The ESLint SourceCode.
 * @returns {ASTNode} The AST node that can be evaluated for appropriate
 * JSDoc comments.
 * @private
 */

const getReducedASTNode = function (node, sourceCode) {
  let {
    parent
  } = node;

  switch (node.type) {
    case 'TSFunctionType':
      return getTSFunctionComment(node);

    case 'TSInterfaceDeclaration':
    case 'TSTypeAliasDeclaration':
    case 'TSEnumDeclaration':
    case 'ClassDeclaration':
    case 'FunctionDeclaration':
      return looksLikeExport(parent) ? parent : node;

    case 'TSDeclareFunction':
    case 'ClassExpression':
    case 'ObjectExpression':
    case 'ArrowFunctionExpression':
    case 'TSEmptyBodyFunctionExpression':
    case 'FunctionExpression':
      if (!invokedExpression.has(parent.type)) {
        while (!sourceCode.getCommentsBefore(parent).length && !/Function/u.test(parent.type) && !allowableCommentNode.has(parent.type)) {
          ({
            parent
          } = parent);

          if (!parent) {
            break;
          }
        }

        if (parent && parent.type !== 'FunctionDeclaration' && parent.type !== 'Program') {
          if (parent.parent && parent.parent.type === 'ExportNamedDeclaration') {
            return parent.parent;
          }

          return parent;
        }
      }

      return node;

    default:
      return node;
  }
};
/**
 * Checks for the presence of a JSDoc comment for the given node and returns it.
 *
 * @param {ASTNode} astNode The AST node to get the comment for.
 * @param {SourceCode} sourceCode
 * @param {{maxLines: Integer, minLines: Integer}} settings
 * @returns {Token|null} The Block comment token containing the JSDoc comment
 *    for the given node or null if not found.
 * @private
 */


const findJSDocComment = (astNode, sourceCode, settings) => {
  const {
    minLines,
    maxLines
  } = settings;
  let currentNode = astNode;
  let tokenBefore = null;

  while (currentNode) {
    const decorator = getDecorator(currentNode);

    if (decorator) {
      currentNode = decorator;
    }

    tokenBefore = sourceCode.getTokenBefore(currentNode, {
      includeComments: true
    });

    if (!tokenBefore || !isCommentToken(tokenBefore)) {
      return null;
    }

    if (tokenBefore.type === 'Line') {
      currentNode = tokenBefore;
      continue;
    }

    break;
  }

  if (tokenBefore.type === 'Block' && tokenBefore.value.charAt(0) === '*' && currentNode.loc.start.line - tokenBefore.loc.end.line >= minLines && currentNode.loc.start.line - tokenBefore.loc.end.line <= maxLines) {
    return tokenBefore;
  }

  return null;
};
/**
 * Retrieves the JSDoc comment for a given node.
 *
 * @param {SourceCode} sourceCode The ESLint SourceCode
 * @param {ASTNode} node The AST node to get the comment for.
 * @param {PlainObject} settings The settings in context
 * @returns {Token|null} The Block comment token containing the JSDoc comment
 *    for the given node or null if not found.
 * @public
 */


const getJSDocComment = function (sourceCode, node, settings) {
  const reducedNode = getReducedASTNode(node, sourceCode);
  return findJSDocComment(reducedNode, sourceCode, settings);
};

exports.commentHandler = commentHandler;
exports.commentParserToESTree = commentParserToESTree;
exports.findJSDocComment = findJSDocComment;
exports.getDecorator = getDecorator;
exports.getJSDocComment = getJSDocComment;
exports.getReducedASTNode = getReducedASTNode;
exports.getTokenizers = getTokenizers;
exports.jsdocTypeVisitorKeys = jsdocTypeVisitorKeys;
exports.jsdocVisitorKeys = jsdocVisitorKeys;
exports.jsdoctypeparserToESTree = jsdoctypeparserToESTree;
exports.parseComment = parseComment;
exports.toCamelCase = toCamelCase;
