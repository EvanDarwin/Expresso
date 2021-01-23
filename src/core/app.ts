/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import * as ansiColors from "ansi-colors";
import debug from "debug";
import * as express from "express";
import {Application, Express, RequestHandler} from "express";
import {IRouterMatcher} from "express-serve-static-core"
import {readConfiguration, renderJSX, renderXML} from ".";
import {ConfigKeys, Expresso, ExpressoEnv, ExpressoOptions, ExpressoRequest} from "../types";

/**
 * Express verb functions have the following format:
 *      verb(name: string, ...middleware?, fn: RequestHandler)
 *
 * To get the function to wrap, we replace the last value (assuming it's a function)
 *
 * F = Generic anonymous function
 * TF = Typed anonymous function
 */
const wrapPossiblePromiseFn = (app: Expresso<any>, fn: RequestHandler): RequestHandler =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(e => {
            // get the next method
            if (app.debug) console.error(e)
            next(e)
        })
    }

export function expresso<E, K = keyof E, EK = K | ConfigKeys>(options: ExpressoOptions<E> = {}): Expresso<EK> {
    const log = debug('expresso:app')
    log('creating app')
    const config = readConfiguration<EK>(options.env || {});
    const app = express();

    /** Preferred defaults */
    app.disable('x-powered-by')

    /** Custom express app bindings */
    Object.defineProperty(app, 'env', {
        value: function <D>(key: EK, defaultValue?: D) {
            return config.__secret.get(key) || defaultValue;
        } as ExpressoEnv<EK>
    })

    Object.defineProperty(app, 'debug', {
        get() {
            // This is unsafe, however env is already defined at this point
            return !!+((app as unknown as Expresso).env('APP_DEBUG', 0) || '0')
        }
    })

    Object.defineProperty(app.request, 'currentMs', {
        get(): number {
            return (+new Date) - +(this as ExpressoRequest).at
        }
    })

    // This is now safe, the following changes are remapping existing properties
    const patchedApp = app as unknown as Expresso<EK>;

    // wrap verb methods with async support
    const methodNames: (keyof Application)[] = ['get', 'post', 'patch', 'delete', 'put', 'options', 'head']
    for (const methodName of methodNames) {
        const _oldFn = app[<keyof Express>methodName];
        Object.defineProperty(patchedApp, methodName, {
            value: (...args: Parameters<IRouterMatcher<Expresso>>) => {
                _oldFn.call(app, ...[
                    ...args.slice(0, args.length - 1),
                    wrapPossiblePromiseFn(patchedApp, args[args.length - 1] as RequestHandler)
                ]);
            }
        })
    }

    // wrap send
    const _send = app.response.send;
    Object.defineProperty(app.response, 'send', {
        value: function <ResBody extends any = any>(this: ExpressoRequest, data?: ResBody) {
            if (typeof data === 'object') {
                if (data && 'a' in data && Array.isArray((<any>data)['a'])) {
                    _send.call(this, renderXML(data as any))
                    return
                } else if (data && 'props' in data && 'type' in data && typeof (<any>data)['type'] === 'function') {
                    _send.call(this, renderJSX(data as any));
                    return
                }
            }
            _send.call(this, data);
        }
    })

    log('patch finished')

    /** Logger, only loaded in dev mode or if `DEBUG` is defined, for performance reasons */
    if (patchedApp.debug || (process.env['DEBUG'] || '').length > 0) {
        const log = debug('expresso:http');
        log.color = "36"
        patchedApp.use((req, res, next) => {
            log(`-> ${req.method} ${req.path}`)
            // @ts-ignore
            req.at = new Date();
            res.on('finish', () => {
                let codeColored = res.statusCode.toString();
                if (+codeColored < 300) {
                    codeColored = ansiColors.green(codeColored)
                } else if (+codeColored >= 300 && +codeColored < 400) {
                    codeColored = ansiColors.blue(codeColored)
                } else {
                    codeColored = ansiColors.red(codeColored)
                }
                log(`<- ${req.method} ${req.path} - ${codeColored}`)
            })
            next()
        })
    }
    log('middleware ready')

    return patchedApp;
}
