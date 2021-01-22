import debug from "debug";
import * as express from "express";
import {ErrorRequestHandler, json as jsonMiddleware, raw, RequestHandler, Response, urlencoded} from "express";
import * as helmetBase from "helmet";
import {h} from "preact";
import {ServeStaticOptions} from "serve-static";
import {ServerErrorDefaultPage} from "../preact/ServerErrorDefaultPage";
import {Expresso} from "../types";
import {document} from "./response"

type HelmetOptions = Parameters<typeof helmetBase>[0]

export default {
    parsers: {json: jsonMiddleware, raw, urlencoded},

    error: (fn: (res: Response, err: Error) => string | void): ErrorRequestHandler => {
        return (err, req, res, next) => {
            const log = debug('expresso:error')
            log('begin')
            res.status(500)
            const _ret = fn(res, err)
            if (typeof _ret === 'string') {
                res.send(_ret)
            }
            log('end')
        }
    },

    simpleError: (): ErrorRequestHandler => {
        return (err, req, res, next) => {
            const log = debug('expresso:error')
            log('begin')
            res.status(500)
            document(res, <ServerErrorDefaultPage debug={(req.app as Expresso).debug} error={err}/>);
            log('end')
        }
    },

    /**
     * Include the 'helmet' security middleware
     *
     * @param {HelmetOptions} opts      helmet configuration options
     * @returns {e.RequestHandler}      The helmet middleware
     */
    helmet: (opts?: HelmetOptions): RequestHandler => {
        return helmetBase(opts)
    },

    /**
     * Bind a directory to the /static path in Express
     *
     * @param {string} path The local static resources directory
     * @param {ServeStaticOptions} opts Static options
     */
    static: (path: string, opts?: ServeStaticOptions): RequestHandler => {
        return express.static(path, opts)
    },
}
