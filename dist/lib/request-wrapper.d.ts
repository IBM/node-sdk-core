export declare class RequestWrapper {
    private axiosInstance;
    private compressRequestData;
    constructor(axiosOptions?: any);
    /**
     * Creates the request.
     * 1. Merge default options with user provided options
     * 2. Checks for missing parameters
     * 3. Encode path and query parameters
     * 4. Call the api
     * @private
     * @returns {ReadableStream|undefined}
     * @throws {Error}
     */
    sendRequest(parameters: any): Promise<any>;
    /**
     * Format error returned by axios
     * @param  {object} the object returned by axios via rejection
     * @private
     * @returns {Error}
     */
    formatError(axiosError: any): Error;
    private gzipRequestBody;
}
