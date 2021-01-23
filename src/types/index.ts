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

import {NextFunction} from "express";
import type {Request as CoreRequest, Response as CoreResponse} from "express-serve-static-core";
import * as core from "express-serve-static-core";
import {ParamsDictionary} from "express-serve-static-core";
import {ParsedQs} from "qs";
import {Logger} from "tslog";
import {ConfigKeys, ExpressoEnv} from "./config";

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
        ): void;
    }

    export type ErrorRequestHandler<P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>> = (
        err: any,
        req: ExpressoRequest<P, ResBody, ReqBody, ReqQuery, Locals>,
        res: ExpressoResponse<ResBody, Locals>,
        next: NextFunction,
    ) => void;

    export interface IRouterMatcher<T,
        Method extends 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head' = any> {
        <P = ParamsDictionary,
            ResBody = any,
            ReqBody = any,
            ReqQuery = ParsedQs,
            Locals extends Record<string, any> = Record<string, any>>(
            path: core.PathParams,
            // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
            ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>
        ): T;

        <P = ParamsDictionary,
            ResBody = any,
            ReqBody = any,
            ReqQuery = ParsedQs,
            Locals extends Record<string, any> = Record<string, any>>(
            path: core.PathParams,
            // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
            ...handlers: Array<core.RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>>
        ): T;

        (path: core.PathParams, subApplication: ExpressoApplication): T;
    }

    export type RequestHandlerParams<P = ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = ParsedQs,
        Locals extends Record<string, any> = Record<string, any>> =
        | RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
        | ErrorRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
        | Array<RequestHandler<P> | ErrorRequestHandler<P>>;

    // noinspection JSUnusedGlobalSymbols
    export interface IRouterHandler<T> {
        (...handlers: RequestHandler[]): T;

        (...handlers: core.RequestHandlerParams[]): T;

        <P = ParamsDictionary,
            ResBody = any,
            ReqBody = any,
            ReqQuery = ParsedQs,
            Locals extends Record<string, any> = Record<string, any>>(
            // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
            ...handlers: Array<RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>
        ): T;

        <P = ParamsDictionary,
            ResBody = any,
            ReqBody = any,
            ReqQuery = ParsedQs,
            Locals extends Record<string, any> = Record<string, any>>(
            // tslint:disable-next-line no-unnecessary-generics (This generic is meant to be passed explicitly.)
            ...handlers: Array<RequestHandlerParams<P, ResBody, ReqBody, ReqQuery, Locals>>
        ): T;
    }

    export interface Application extends core.Application {
        get: ((name: string) => any) & IRouterMatcher<this>;
        post: ((name: string) => any) & IRouterMatcher<this>;
        put: ((name: string) => any) & IRouterMatcher<this>;
        delete: ((name: string) => any) & IRouterMatcher<this>;
        patch: ((name: string) => any) & IRouterMatcher<this>;
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

declare namespace ExpressServeStaticCore {
    export interface Request<P = core.ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery = core.Query,
        Locals extends Record<string, any> = Record<string, any>> extends CoreRequest<P, ResBody, ReqBody, ReqQuery, Locals> {
    }

    export interface Response<ResBody = any,
        Locals extends Record<string, any> = Record<string, any>> extends CoreResponse<ResBody, Locals> {
    }
}

export interface ExpressoApplication extends Express.Application {
    request: ExpressoRequest;
    response: ExpressoResponse;
    debug: boolean;
    logger: Logger;
    _router: { stack: Layer[] } | any
}

export interface Expresso<CK = ConfigKeys> extends ExpressoApplication {
    env: ExpressoEnv<CK>;
}

export interface ExpressoRequest<P = core.ParamsDictionary, ResBody = any, ReqBody = any,
    ReqQuery = core.Query, Locals extends Record<string, any> = Record<string, any>> extends ExpressServeStaticCore.Request<P, ResBody, ReqBody, ReqQuery, Locals> {
    at: Date;
    currentMs: number;
    app: ExpressoApplication;
    uuid: string;
}

export interface ExpressoResponse<ResBody = any, Locals extends Record<string, any> = Record<string, any>>
    extends ExpressServeStaticCore.Response<ResBody, Locals> {
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
