/**
 * (C) Copyright IBM Corp. 2022, 2023.
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

import extend from 'extend';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { Cookie, CookieJar } from 'tough-cookie';
import logger from './logger';

export class CookieInterceptor {
  private readonly cookieJar: CookieJar;

  constructor(cookieJar: CookieJar | boolean) {
    if (cookieJar) {
      if (cookieJar === true) {
        logger.debug('CookieInterceptor: creating new CookieJar');
        this.cookieJar = new CookieJar();
      } else {
        logger.debug('CookieInterceptor: using supplied CookieJar');
        this.cookieJar = cookieJar;
      }
    } else {
      throw new Error('Must supply a cookie jar or true.');
    }
  }

  /**
   * This is called by Axios when a request is about to be sent in order to
   * copy the cookie string from the URL to a request header.
   *
   * @param config the Axios request config
   * @returns the request config
   */
  public async requestInterceptor(config: InternalAxiosRequestConfig) {
    logger.debug('CookieInterceptor: intercepting request');
    if (config && config.url) {
      logger.debug(`CookieInterceptor: getting cookies for: ${config.url}`);
      const cookieHeaderValue = await this.cookieJar.getCookieString(config.url);
      if (cookieHeaderValue) {
        logger.debug('CookieInterceptor: setting cookie header');
        const cookieHeader = { cookie: cookieHeaderValue };
        config.headers = extend(true, {}, config.headers, cookieHeader);
      } else {
        logger.debug(`CookieInterceptor: no cookies for: ${config.url}`);
      }
    } else {
      logger.debug('CookieInterceptor: no request URL.');
    }
    return config;
  }

  /**
   * This is called by Axios when a 2xx response has been received.
   * We'll invoke the configured cookie jar's setCookie() method to handle
   * the "set-cookie" header.
   * @param response the Axios response object
   * @returns the response object
   */
  public async responseInterceptor(response: AxiosResponse) {
    logger.debug('CookieInterceptor: intercepting response.');
    if (response && response.headers) {
      logger.debug('CookieInterceptor: checking for set-cookie headers.');
      const cookies: string[] = response.headers['set-cookie'];
      if (cookies) {
        logger.debug(`CookieInterceptor: setting cookies in jar for URL ${response.config.url}.`);
        // Write cookies sequentially by chaining the promises in a reduce
        await cookies.reduce(
          (cookiePromise: Promise<Cookie>, cookie: string) =>
            cookiePromise.then(() => this.cookieJar.setCookie(cookie, response.config.url)),
          Promise.resolve(null)
        );
      } else {
        logger.debug('CookieInterceptor: no set-cookie headers.');
      }
    } else {
      logger.debug('CookieInterceptor: no response headers.');
    }
    return response;
  }

  /**
   * This is called by Axios when a non-2xx response has been received.
   * We'll simply invoke the "responseFulfilled" method since we want to
   * do the same cookie handler as for a success response.
   * @param error the Axios error object that describes the non-2xx response
   * @returns the error object
   */
  public async responseRejected(error: any) {
    logger.debug('CookieIntercepter: intercepting error response');

    if (error && error.response) {
      logger.debug('CookieIntercepter: delegating to responseInterceptor()');
      await this.responseInterceptor(error.response);
    } else {
      logger.debug('CookieInterceptor: no response field in error object, skipping...');
    }

    return Promise.reject(error);
  }
}
