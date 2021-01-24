/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-interface */

import type {NextFunction, Request as BaseRequest, Response as BaseResponse} from "express";
import type {ParamsDictionary} from "express-serve-static-core";
import * as core from "express-serve-static-core";
import * as http from "http";
import type {ParsedQs} from "qs";
import {Logger} from "tslog";
import type {ConfigKeys, ExpressoEnv} from "./config";

export * from "./config";
export * from "./doctype";

declare namespace Express {
    export interface RequestHandler<P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>> {
        // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2)
        (
            req: ExpressoRequest<P, ResBody, ReqBody, ReqQuery, Locals>,
            res: ExpressoResponse<ResBody, Locals>,
            next: NextFunction,
        ): void | Promise<void>;
    }

    export interface IRouterMatcher<T,
        Method extends 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' = any> extends core.IRouterMatcher<T, Method> {
        <P = ParamsDictionary,
            ResBody = any,
            ReqBody = any,
            ReqQuery = ParsedQs,
            Locals extends Record<string, any> = Record<string, any>>(
            path: core.PathParams,
            // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
            ...handlers: Array<Express.RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>
        ): T;

        <P = ParamsDictionary,
            ResBody = any,
            ReqBody = any,
            ReqQuery = ParsedQs,
            Locals extends Record<string, any> = Record<string, any>>(
            path: core.PathParams,
            // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
            ...handlers: Array<Express.RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>>
        ): T;

        (path: core.PathParams, subApplication: ExpressoApplication): T | Promise<T>;
    }

    export type RequestHandlerParams<P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>> =
        | Express.RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
        | Array<Express.RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>;

    export interface Application extends core.Application {
        (req: ExpressoRequest | http.IncomingMessage, res: ExpressoResponse | http.ServerResponse): any;

        request: ExpressoRequest;
        response: ExpressoResponse;
        debug: boolean;
        logger: Logger;
        _router: { stack: Layer[] } | any
    }

    export interface Request<P = core.ParamsDictionary, ResBody = any, ReqBody = any,
        ReqQuery = core.Query, Locals extends Record<string, any> = Record<string, any>>
        extends BaseRequest<P, ResBody, ReqBody, ReqQuery, Locals> {
        /** The expresso application */
        app: ExpressoApplication;

        /** The date the request was initiated at */
        at: Date;

        /** The current difference in milliseconds between `req.at` and the current time. */
        msTotal: number;

        /** The current difference in milliseconds between `req.at` and the current time.
         * @deprecated Please use `msTotal` in the future, this will be removed soon. */
        currentMs: number;

        /** A unique identifier for the current request */
        uuid: string;

        /** A common logger */
        logger: Logger;
    }

    export interface Response<ResBody = any, Locals extends Record<string, any> = Record<string, any>> extends BaseResponse<ResBody, Locals> {
    }

    export interface RequestHandler<P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>> {
        // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2)
        (
            req: ExpressoRequest<P, ResBody, ReqBody, ReqQuery, Locals>,
            res: ExpressoResponse<ResBody, Locals>,
            next: NextFunction,
        ): void;
    }
}

export interface ExpressoApplication extends Express.Application {
    get: ((name: string) => any) & Express.IRouterMatcher<this>;
    post: ((name: string) => any) & Express.IRouterMatcher<this>;
    put: ((name: string) => any) & Express.IRouterMatcher<this>;
    patch: ((name: string) => any) & Express.IRouterMatcher<this>;
    delete: ((name: string) => any) & Express.IRouterMatcher<this>;
    head: ((name: string) => any) & Express.IRouterMatcher<this>;
    all: ((name: string) => any) & Express.IRouterMatcher<this>;
}

export interface Expresso<CK = ConfigKeys> extends ExpressoApplication {
    env: ExpressoEnv<CK>;
}

export interface ExpressoRequest<P = core.ParamsDictionary, ResBody = any, ReqBody = any,
    ReqQuery = core.Query, Locals extends Record<string, any> = Record<string, any>>
    extends Express.Request<P, ResBody, ReqBody, ReqQuery, Locals> {
}

export interface ExpressoResponse<ResBody = any, Locals extends Record<string, any> = Record<string, any>>
    extends Express.Response<ResBody, Locals> {
}

/**
 * Express does not provide types for these internal parts, from what I can
 * tell. Let's just recreate them.
 */
export interface Layer<Params = { [key: string]: any }> {
    handle: Express.RequestHandler;
    name: string;
    params: Params | undefined;
    path: string | undefined;
    keys: any[];
    regexp: RegExp;
    route: Route | undefined;
}

export interface Route {
    path: string;
    stack: Layer[];
    methods: { [K in 'get' | 'post' | 'patch' | 'put' | 'delete' | 'head']: boolean },
}
