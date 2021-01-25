/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import * as ansiColors from "ansi-colors"
import debug from "debug";
import * as express from "express";
import {json as jsonMiddleware, NextFunction, raw, RequestHandler, urlencoded} from "express";
import * as helmetBase from "helmet";
import {h} from "preact";
import {ServeStaticOptions} from "serve-static";
import {InternalErrorPage} from "../preact/components/error/InternalErrorPage";
import {NotFoundErrorPage} from "../preact/components/error/NotFoundErrorPage";
import {ExpressoRequest, ExpressoResponse} from "../types";
import {renderJSX} from "./render";

const _internal_log = debug("expresso:http")
_internal_log.color = "36";
export const InternalMiddleware: { requestLogger: RequestHandler } = {
    requestLogger: (req, res, next) => {
        _internal_log(`${ansiColors.green(req.method)} ${ansiColors.yellowBright(req.path)}`);
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
            _internal_log(`${ansiColors.green(req.method)} ${ansiColors.yellowBright(req.path)} - ${codeColored}`)
        })
        next()
    },
}

export interface Middleware {
    parsers: {
        /**
         * JSON data parser
         * @see express.json
         */
        json: typeof jsonMiddleware,

        /**
         * Raw data parser
         * @see express.raw
         */
        raw: typeof raw,

        /**
         * URL encoded data parser
         * @see express.urlencoded
         */
        urlencoded: typeof urlencoded,
    };

    /**
     * Include the 'helmet' security middleware
     * @see helmet
     */
    helmet: typeof helmetBase;

    /**
     * Bind either the default 404 page, or define your own custom renderer.
     * This middleware must be defined **AFTER** all other routes, or you will
     * encounter unwanted 404 errors.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notFound(fn?: (req: ExpressoRequest, res: ExpressoResponse) => any): RequestHandler;

    /** Bind either the default error page, or define your own custom renderer. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(fn?: (err: Error, req: ExpressoRequest, res: ExpressoResponse, next: NextFunction) => any):
        (err: Error, req: ExpressoRequest, res: ExpressoResponse, next: NextFunction) => any;

    /** Bind a directory to the /static path in Express */
    static(path: string, opts?: ServeStaticOptions): RequestHandler
}

/** Popular, useful middlewares for expresso/express */
export const Middleware: Middleware = {
    parsers: {json: jsonMiddleware, raw, urlencoded},

    helmet: helmetBase,

    notFound: (fn?): RequestHandler => {
        // noinspection UnnecessaryLocalVariableJS
        const expressoNotFound: RequestHandler = (req, res) => {
            res.status(404)
            const _ret = !fn
                ? renderJSX(<NotFoundErrorPage req={req as ExpressoRequest}/>)
                : fn(req as ExpressoRequest, res as ExpressoResponse)
            if (typeof _ret === 'string') {
                res.send(_ret)
            }
        }
        return expressoNotFound;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (fn?) => {
        if (typeof fn === 'function') return fn
        // the fourth parameter is required for express to detect it as an error handler
        return function expressoError(err: Error, req: express.Request, res: express.Response, next: NextFunction) {
            if (!res.statusCode || res.statusCode === 200) res.status(500)
            res.send(renderJSX(<InternalErrorPage req={req as ExpressoRequest} error={err}/>));
        }
    },

    static: (path: string, opts?: ServeStaticOptions): RequestHandler => {
        return express.static(path, opts)
    },
}
