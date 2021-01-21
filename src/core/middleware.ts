import {json as jsonMiddleware, raw, urlencoded} from "body-parser";
import * as express from "express";
import {RequestHandler} from "express";
import * as helmetBase from "helmet";
import {ServeStaticOptions} from "serve-static";

type HelmetOptions = Parameters<typeof helmetBase>[0]

export default {
    parsers: {json: jsonMiddleware, raw, urlencoded},

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
