import debug from "debug";
import express from "express";
import {ConfigKeys, Expresso, ExpressoEnv, ExpressoOptions} from "../types";
import {readConfiguration} from ".";

export function expresso<E, K = keyof E, EK = K | ConfigKeys>(options: ExpressoOptions<E> = {}): Expresso<EK> {
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

    return <Expresso<EK>>app;
}
