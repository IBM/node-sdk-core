/// <reference types="node" />
import { FileObject } from "./helper";
declare const _default: {
    fromFilename: (file: String | File | Buffer | NodeJS.ReadableStream | FileObject) => string;
    fromHeader: (buffer: Buffer) => string;
};
export default _default;
