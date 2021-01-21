import debug from "debug";
import * as express from "express";
import {Express} from "express";
import {IRouterMatcher} from "express-serve-static-core";
import {readConfiguration} from ".";
import {ConfigKeys, Expresso, ExpressoEnv, ExpressoOptions} from "../types";

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
            return !!+((<Expresso>app).env('APP_DEBUG', 0) || '0')
        }
    })

    // wrap .get()/.post()/.patch()/.delete()/.put() methods
    const methodNames: (keyof Express)[] = ['get', 'post', 'patch', 'delete', 'put', 'options', 'head']
    for (const methodName of methodNames) {
        const _oldFn = (<Expresso>app)[<keyof Express>methodName];

        type ExpressoRouteBindFn = ((name: string) => any) & IRouterMatcher<Expresso>
        type ExpressoRouteBindFnParams = Parameters<ExpressoRouteBindFn>;
        /**
         * F = Generic anonyomus function
         * A = Parameter types of provided function
         * W = Resolved anonymous function with injected parameter types
         */
        const wrapPossiblePromiseFn =
            <F extends (...args: any) => any, A = Parameters<F>>(fn: F) =>
                (...args: A[]) => {
                    const res = fn(...args);
                    return (res instanceof Promise) ? Promise.resolve(res) : res;
                }

        type ExpressoVerbFn = typeof app.get | typeof app.post | typeof app.head |
            typeof app.delete | typeof app.put | typeof app.patch | typeof app.options;

        Object.defineProperty(app, methodName, {
            value: (...args: (ExpressoVerbFn | unknown)[]) => {
                args.map((arg) => {
                    if (Array.isArray(arg)) {
                        return arg.map((a) => wrapPossiblePromiseFn<ExpressoVerbFn>(a))
                    } else if (typeof arg === 'function') {
                        return wrapPossiblePromiseFn<ExpressoVerbFn>(arg as ExpressoVerbFn)
                    } else {
                        return arg;
                    }
                });
                _oldFn.call(app, ...args);
            }
        })
    }
    log('patch finished')

    /** Logger, only loaded in dev mode or if `DEBUG` is defined, for performance reasons */
    if ((<Expresso<EK>>app).debug || (process.env['DEBUG'] || '').length > 0) {
        const log = debug('expresso:http')
        log.color = "36"
        app.use((req, res, next) => {
            log(`-> HTTP/${req.httpVersion} ${req.method} ${req.path}`)
            next()
            log(`<- HTTP/${req.httpVersion} ${req.method} ${req.path} - ${res.statusCode}`)
        })
    }
    log('middleware ready')

    return <Expresso<EK>>app;
}
