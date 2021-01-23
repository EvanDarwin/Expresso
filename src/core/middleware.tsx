/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import * as express from "express";
import {ErrorRequestHandler, json as jsonMiddleware, NextFunction, raw, RequestHandler, urlencoded} from "express";
import * as helmetBase from "helmet";
import {h} from "preact";
import {ServeStaticOptions} from "serve-static";
import {InternalErrorPage} from "../preact/components/error/InternalErrorPage";
import {NotFoundErrorPage} from "../preact/components/error/NotFoundErrorPage";
import {ExpressoRequest, ExpressoResponse} from "../types";
import {renderJSX} from "./render";

type HelmetOptions = Parameters<typeof helmetBase>[0]

export default {
    /** Common express request parsers */
    parsers: {
        /**
         * JSON data parser
         * @see express.json
         */
        json: jsonMiddleware,

        /**
         * Raw data parser
         * @see express.raw
         */
        raw,

        /**
         * URL encoded data parser
         * @see express.urlencoded
         */
        urlencoded
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notFound: (fn?: (req: ExpressoRequest, res: ExpressoResponse) => any): RequestHandler => {
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
    error: (fn?: (res: ExpressoResponse, err: Error) => any): ErrorRequestHandler => {
        // the fourth parameter is required for express to detect it as an error handler
        // noinspection UnnecessaryLocalVariableJS
        const expressoError: ErrorRequestHandler =
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (err: Error, req, res, next: NextFunction) => {
                if (!res.statusCode || res.statusCode === 200) res.status(500)
                const _ret = !fn
                    ? renderJSX(<InternalErrorPage req={req as ExpressoRequest} error={err}/>)
                    : fn(res as ExpressoResponse, err)
                if (typeof _ret === 'string') {
                    res.send(_ret)
                }
            }
        return expressoError;
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
