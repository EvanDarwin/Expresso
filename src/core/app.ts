/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import debug from "debug";
import type {Express, RequestHandler} from "express";
import * as express from "express";
import type {IRouterMatcher} from "express-serve-static-core"
import {JSXNode} from "jsx-xml";
import {VNode} from "preact";
import {Logger} from "tslog";
import {readConfiguration, renderJSX, renderXML} from ".";
import type {
    ConfigKeys,
    Expresso,
    ExpressoApplication,
    ExpressoConfiguration,
    ExpressoEnv,
    ExpressoOptions,
    ExpressoRequest
} from "../types";
import {asyncHandler} from "./async";
import {InternalMiddleware} from "./middleware";

/**
 * Create a new expresso framework application.
 * The `expresso()` applies the necessary bindings for the framework,
 * you should NOT use `express()`.
 *
 * @param {ExpressoOptions<E>} options
 * @returns {Expresso<EK>}
 */
export function expresso<E, K = keyof E, EK = K | ConfigKeys>(options: ExpressoOptions<E> = {}): Expresso<EK> {
    const log = debug('expresso:app')
    log('creating app')

    const config = readConfiguration<EK>(options.env || {});
    const app = bindExpressApplication<E, EK>(options, config, express());
    log('patch finished')

    // Only load the HTTP logger if debug is enabled
    if (app.debug) {
        app.use(InternalMiddleware.requestLogger)
    }
    log('middleware ready')

    return app;
}

/**
 * Apply property bindings and assignment to the standard express Application
 *
 * @internal
 * @param opts
 * @param {ExpressoConfiguration<EK>} config
 * @param {e.Express} app
 * @returns {Expresso<EK>}
 */
function bindExpressApplication<E, EK>(opts: ExpressoOptions<E>, config: ExpressoConfiguration<EK>, app: Express): Expresso<EK> {
    /** Preferred defaults */
    app.disable('x-powered-by')

    /** User options */
    if (typeof opts.trustProxy !== 'undefined') {
        app.enable('trust proxy')
        app.set('trust proxy', opts.trustProxy)
    }

    /**
     * Define new properties on express objects. These will not modify
     * the actual express prototypes, so they can be used safely.
     */

    // Define the `app.env` property
    Object.defineProperty(app, 'env', {
        value: function <D>(key: EK, defaultValue?: D) {
            return config.__secret.get(key) || defaultValue;
        } as ExpressoEnv<EK>
    })

    // Define the `app.debug` property, for determining if the application is
    // running in debug mode
    Object.defineProperty(app, 'debug', {
        get() {
            // This is unsafe, however env is already defined at this point
            return (typeof opts.debug === 'undefined')
                ? !!+((<Expresso>app).env('APP_DEBUG', 0))
                : opts.debug;
        }
    })

    // Define the `app.logger` property, for a common logger
    Object.defineProperty(app, 'logger', {
        value: new Logger({displayFunctionName: false})
    })

    // Additionally, set a getter on the Request object to access
    // the logger from `req`
    Object.defineProperty(app.request, 'logger', {
        get(this: ExpressoRequest): Logger {
            return this.app.logger;
        }
    });

    // Define the getter method for retrieving the current ms diff since
    // the request began.
    ['msTotal', 'currentMs'].forEach(k => {
        Object.defineProperty(app.request, k, {
            get(): number {
                return (+new Date) - +(this as ExpressoRequest).at
            }
        })
    })

    // Define the `req.uuid` property on Request, for unique request IDs
    Object.defineProperty(app.request, 'uuid', {
        get(this: ExpressoRequest & { __uuid?: string; }) {
            if (!this.__uuid) {
                Object.defineProperty(this, '__uuid', {
                    value: config.generators.requestID(),
                    writable: false
                })
            }
            return <string>this.__uuid;
        }
    })

    // Wrap common verb methods with async support
    const methodNames: (keyof ExpressoApplication)[] = ['all', 'get', 'post', 'patch', 'delete', 'put', 'options', 'head']
    for (const methodName of methodNames) {
        const _oldFn = app[<keyof Express>methodName];
        Object.defineProperty(app, methodName, {
            value: (...args: Parameters<IRouterMatcher<Expresso>>) => {
                _oldFn.call(app, ...[
                    ...args.slice(0, args.length - 1),
                    asyncHandler(app as Expresso, args[args.length - 1] as RequestHandler)
                ]);
            }
        })
    }

    // wrap send
    const _send = app.response.send;
    Object.defineProperty(app.response, 'send', {
        value: function <ResBody>(this: ExpressoRequest, data?: ResBody | VNode) {
            if (typeof data === 'object' && 'props' in data &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                'type' in data && typeof (data as any)['type'] !== 'undefined') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                _send.call(this, renderJSX(data as any));
                return
            }
            _send.call(this, data);
        }
    })

    // define .xml
    Object.defineProperty(app.response, 'xml', {
        value: function (this: ExpressoRequest, dom: JSXNode) {
            _send.call(this, renderXML(dom))
        }
    })

    // Expresso app is ready
    return app as Expresso<EK>;
}
