import * as ansiColors from "ansi-colors";
import debug from "debug";
import * as express from "express";
import {Express, RequestHandler} from "express";
import {IRouterMatcher} from "express-serve-static-core"
import {readConfiguration} from ".";
import {ConfigKeys, Expresso, ExpressoEnv, ExpressoOptions} from "../types";

/**
 * Express verb functions have the following format:
 *      verb(name: string, ...middleware?, fn: RequestHandler)
 *
 * To get the function to wrap, we replace the last value (assuming it's a function)
 *
 * F = Generic anonymous function
 * TF = Typed anonymous function
 */
const wrapPossiblePromiseFn = (app: Express, fn: RequestHandler): RequestHandler =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(e => {
            // get the next method
            if ((<Expresso>app).debug) console.error(e)
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
            return !!+((<Expresso>app).env('APP_DEBUG', 0) || '0')
        }
    })

    // wrap .get()/.post()/.patch()/.delete()/.put() methods
    const methodNames: (keyof Express)[] = ['get', 'post', 'patch', 'delete', 'put', 'options', 'head']
    for (const methodName of methodNames) {
        const _oldFn = (<Expresso>app)[<keyof Express>methodName];
        Object.defineProperty(app, methodName, {
            value: (...args: Parameters<IRouterMatcher<Expresso>>) => {
                _oldFn.call(app, ...[
                    ...args.slice(0, args.length - 1),
                    wrapPossiblePromiseFn(app, args[args.length - 1] as RequestHandler)
                ]);
            }
        })
    }
    log('patch finished')

    /** Logger, only loaded in dev mode or if `DEBUG` is defined, for performance reasons */
    if ((<Expresso<EK>>app).debug || (process.env['DEBUG'] || '').length > 0) {
        const log = debug('expresso:http')
        log.color = "36"
        app.use((req, res, next) => {
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

    return <Expresso<EK>>app;
}
