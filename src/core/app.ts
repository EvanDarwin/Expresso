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
import {Logger} from "tslog";
import {v4 as uuidv4} from "uuid";
import {readConfiguration, renderJSX, renderXML} from ".";
import {ConfigKeys, Expresso, ExpressoEnv, ExpressoOptions, ExpressoRequest} from "../types";

/** Automatically handle asynchronous functions in express handlers */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asyncHandler = (app: Expresso<any>, fn: RequestHandler): RequestHandler =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(e => next(e))
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

    Object.defineProperty(app, 'logger', {value: new Logger()})

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
                    asyncHandler(patchedApp, args[args.length - 1] as RequestHandler)
                ]);
            }
        })
    }

    // bind req.uuid
    Object.defineProperty(app.request, 'uuid', {
        // __uuid is a hidden property, so it is typed as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get(this: ExpressoRequest & any) {
            if (!this.__uuid) {
                Object.defineProperty(this, '__uuid', {value: uuidv4(), writable: false})
            }
            return this.__uuid as string;
        }
    })

    // wrap send
    const _send = app.response.send;
    Object.defineProperty(app.response, 'send', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value: function <ResBody>(this: ExpressoRequest, data?: ResBody & any) {
            if (typeof data === 'object') {
                if (data && 'a' in data && Array.isArray(data['a'])) {
                    _send.call(this, renderXML(data))
                    return
                } else if (data && 'props' in data && 'type' in data && typeof data['type'] === 'function') {
                    _send.call(this, renderJSX(data));
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
        const expressoRequestLogger: RequestHandler = (req, res, next) => {
            log(`${ansiColors.green(req.method)} ${ansiColors.yellowBright(req.path)}`);
            (req as ExpressoRequest).at = new Date();
            res.on('finish', () => {
                let codeColored = res.statusCode.toString();
                if (+codeColored < 400) {
                    codeColored = ansiColors.green(codeColored)
                } else if (+codeColored >= 400 && +codeColored < 500) {
                    codeColored = ansiColors.yellow(codeColored)
                } else {
                    codeColored = ansiColors.red(codeColored)
                }
                log(`${ansiColors.green(req.method)} ${ansiColors.yellowBright(req.path)} - ${codeColored}`)
            })
            next()
        }
        patchedApp.use(expressoRequestLogger)
    }
    log('middleware ready')

    return patchedApp;
}
