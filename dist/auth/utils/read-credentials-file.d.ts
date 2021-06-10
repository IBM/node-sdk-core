/**
 * Return a config object based on a credentials file. Credentials files can
 * be specified filepath via the environment variable: `IBM_CREDENTIALS_FILE`.
 */
export declare function readCredentialsFile(): any;
export declare function fileExistsAtPath(filepath: any): boolean;
export declare function constructFilepath(filepath: any): string;
