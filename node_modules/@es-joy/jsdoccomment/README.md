# @es-joy/jsdoccomment

[![Node.js CI status](https://github.com/brettz9/getJSDocComment/workflows/Node.js%20CI/badge.svg)](https://github.com/brettz9/getJSDocComment/actions)

This project aims to preserve and expand upon the
`SourceCode#getJSDocComment` functionality of the deprecated ESLint method.

It also exports a number of functions currently for working with JSDoc:

- `parseComment` - For parsing `comment-parser` in a JSDoc-specific manner.
- `commentHandler` - Used by `eslint-plugin-jsdoc`. Might be removed in future.
- `commentParserToESTree`- Converts [comment-parser](https://github.com/syavorsky/comment-parser)
    AST to ESTree/ESLint/Babel friendly AST
- `jsdoctypeparserToESTree`- Converts [jsdoctypeparser](https://github.com/jsdoctypeparser/jsdoctypeparser)
    AST to ESTree/ESLint/Babel friendly AST
- `jsdocVisitorKeys` - The [VisitorKeys](https://github.com/eslint/eslint-visitor-keys)
    for `JSDocBlock`, `JSDocDescriptionLine`, and `JSDocTag`. Might change.
- `jsdocTypeVisitorKeys` - [VisitorKeys](https://github.com/eslint/eslint-visitor-keys)
    for jsdoctypeparser. More likely to be subject to change.
- `getTokenizers` - A utility. Might be removed in future.
- `toCamelCase` - A utility. Might be removed in future.

## ESLint AST produced for `comment-parser` nodes (`JSDocBlock`, `JSDocTag`, and `JSDocDescriptionLine`)

Note: Although not added in this package, `@es-joy/jsdoc-eslint-parser` adds
a `jsdoc` property to other ES nodes (using this project's `getJSDocComment`
to determine the specific comment-block that will be attached as AST).

### `JSDocBlock`

Has two visitable properties:

1. `tags` (an array of `JSDocTag`; see below)
2. `descriptionLines` (an array of `JSDocDescriptionLine` for multiline
    descriptions).

Has the following custom non-visitable property:

1. `lastDescriptionLine` - A number

May also have the following non-visitable properties from `comment-parser`:

1. `description` - Same as `descriptionLines` but as a string with newlines.
2. `delimiter`
3. `postDelimiter`
4. `end`

### `JSDocTag`

Has three visitable properties:

1. `parsedType` (the `jsdoctypeparser` AST representaiton of the tag's
    type (see the `jsdoctypeparser` section below)).
2. `descriptionLines`' (an array of `JSDocDescriptionLine` for multiline
    descriptions)
3. `typeLines` (an array of `JSDocTypeLine` for multiline type strings)

May also have the following non-visitable properties from `comment-parser`
(note that all are included from `comment-parser` except `end` as that is only
for JSDoc blocks and note that `type` is renamed to `rawType`):

1. `description` - Same as `descriptionLines` but as a string with newlines.
2. `rawType` - `comment-parser` has this named as `type`, but because of a
    conflict with ESTree using `type` for Node type, we renamed it to
    `rawType`. It is otherwise the same as in `comment-parser`, i.e., a string
    with newlines, though with the initial `{` and final `}` stripped out.
    See `typeLines` for the array version of this property.
3. `start`
4. `delimiter`
5. `postDelimiter`
6. `tag` (this does differ from `comment-parser` now in terms of our stripping
    the initial `@`)
7. `postTag`
8. `name`
9. `postName`
10. `type`
11. `postType`

### `JSDocDescriptionLine`

No visitable properties.

May also have the following non-visitable properties from `comment-parser`:

1. `delimiter`
2. `postDelimiter`
3. `start`
4. `description`

### `JSDocTypeLine`

No visitable properties.

May also have the following non-visitable properties from `comment-parser`:

1. `delimiter`
2. `postDelimiter`
3. `start`
4. `rawType` - Renamed from `comment-parser` to avoid a conflict. See
    explanation under `JSDocTag`

## ESLint AST produced for `jsdoctypeparser`

The `type` has been changed for the type AST. Relative to `jsdoctypeparser`
nodes, the type will have a `JSDocType` prefix added plus a camel-casing of the
old type name, so, e.g., `INSTANCE_MEMBER` will become
`JSDocTypeInstanceMember`.
See [jsdoctypeparser](https://github.com/jsdoctypeparser/jsdoctypeparser)
for the current list of node types which are transformed in this manner.

Otherwise, the node properties are as in `jsdoctypeparser`.

The `jsdoctypeparser` visitor keys are also modified accordingly.

## Installation

```shell
npm i @es-joy/jsdoccomment
```

## Changelog

The changelog can be found on the [CHANGES.md](./CHANGES.md).
<!--## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](CONTRIBUTING.md).
-->
## Authors and license

[Brett Zamir](http://brett-zamir.me/) and
[contributors](https://github.com/es-joy/jsdoc-eslint-parser/graphs/contributors).

MIT License, see the included [LICENSE-MIT.txt](LICENSE-MIT.txt) file.

## To-dos

1. Get complete code coverage
2. If `comment-parser` (and `jsdoctypeparser`) are not exporting proper
    ESLint AST, then provide simple utilities to convert their AST
