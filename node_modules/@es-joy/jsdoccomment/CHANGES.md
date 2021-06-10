# CHANGES for `@es-joy/jsdoccomment`

## 0.6.0

- Change `comment-parser` `tag` AST to avoid initial `@`

## 0.5.1

- Fix: Avoid setting `variation` name (just the description) (including in
    dist)
- npm: Add `prepublishOnly` script

## 0.5.0

- Fix: Avoid setting `variation` name (just the description)

## 0.4.4

- Fix: Avoid setting `name` and `description` for simple `@template SomeName`

## 0.4.3

- npm: Ignores Github file

## 0.4.2

- Fix: Ensure replacement of camel-casing (used in `jsdoctypeparser` nodes and
    visitor keys is global. The practical effect is that
    `JSDocTypeNamed_parameter` -> `JSDocTypeNamedParameter`,
    `JSDocTypeRecord_entry` -> `JSDocTypeRecordEntry`
    `JSDocTypeNot_nullable` -> `JSDocTypeNotNullable`
    `JSDocTypeInner_member` -> `JSDocTypeInnerMember`
    `JSDocTypeInstance_member` -> `JSDocTypeInstanceMember`
    `JSDocTypeString_value` -> `JSDocTypeStringValue`
    `JSDocTypeNumber_value` -> `JSDocTypeNumberValue`
    `JSDocTypeFile_path` -> `JSDocTypeFilePath`
    `JSDocTypeType_query` -> `JSDocTypeTypeQuery`
    `JSDocTypeKey_query` -> `JSDocTypeKeyQuery`
- Fix: Add missing `JSDocTypeLine` to visitor keys
- Docs: Explain AST structure/differences

## 0.4.1

- Docs: Indicate available methods with brief summary on README

## 0.4.0

- Enhancement: Expose `parseComment` and `getTokenizers`.

## 0.3.0

- Enhancement: Expose `toCamelCase` as new method rather than within a
    utility file.

## 0.2.0

- Enhancement: Exposes new methods: `commentHandler`,
    `commentParserToESTree`, `jsdocVisitorKeys`, `jsdoctypeparserToESTree`,
    `jsdocTypeVisitorKeys`,

## 0.1.1

- Build: Add Babel to work with earlier Node

## 0.1.0

- Initial version
