import {json as jsonMiddleware, raw, urlencoded} from "body-parser";
import debug from "debug";
import express, {Express, RequestHandler, Response} from "express"
import helmetBase from "helmet";
import {JSXNode, render as _renderXML} from "jsx-xml";
import {VNode} from "preact";
import _renderJSX from "preact-render-to-string";
import {ServeStaticOptions} from "serve-static";
import {Connection, ConnectionOptions, ConnectionOptionsReader, createConnection} from "typeorm";
import {ConfigKeys, ConfigSetDataSimple, readConfiguration} from "./config";

// Load pretty errors

export * from "./config";

type ExpressoEnv<CK> = <T>(key: CK, defaultValue?: T) => T | undefined;

export interface Expresso<CK = ConfigKeys> extends Express {
    env: ExpressoEnv<CK>;
    debug: boolean;
}

interface ExpressoOptions<E = ConfigSetDataSimple> {
    env?: E;
}

export function expresso<E, K = keyof E, EK = K | ConfigKeys>(options: ExpressoOptions<E> = {}): Expresso<EK> {
    const config = readConfiguration<EK>(options.env || {});
    const app = express();

    /** Preferred defaults */
    app.disable('x-powered-by')

    /** Custom express app bindings */
    Object.defineProperty(app, 'env', {
        value: function <R>(key: EK, defaultValue?: any) {
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

export const middleware = {
    parsers: {json: jsonMiddleware, raw, urlencoded},
    helmet: (opts?: object): RequestHandler => {
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

export async function connect(): Promise<Connection>;
export async function connect(name: string): Promise<Connection>;
export async function connect(options: ConnectionOptions): Promise<Connection>;
export async function connect(opt?: string | ConnectionOptions): Promise<Connection> {
    // patch typeorm
    Object.defineProperty(ConnectionOptionsReader.prototype, 'baseDirectory', {
        /**
         * Gets directory where configuration file should be located.
         */
        get: function () {
            if (this.options && this.options.root)
                return this.options.root;
            return process.cwd();
        },
        enumerable: true,
        configurable: true
    })

    const log = debug('expresso:db')
    log('begin connect')
    let res: Promise<Connection>;
    if (typeof opt === 'string') {
        res = createConnection(opt)
    } else if (typeof opt === 'undefined') {
        res = createConnection();
    } else {
        res = createConnection(opt);
    }
    return res.then((c) => {
        log('connected')
        return c;
    }).catch((e) => {
        throw e;
    });
}

/**
 * Render a TSX Preact DOM into a string
 *
 * @param {preact.VNode}    jsx         The TSX to render
 * @param {D}               context     The context to provide to the renderer
 * @returns {string}        The rendered Preact DOM
 */
export function renderJSX<D = {}>(jsx: VNode, context?: D): string {
    const log = debug('expresso:render:jsx')
    log('start')
    const dom = _renderJSX(jsx, context);
    log('rendered JSX')
    return dom;
}

export function renderXML(xml: JSXNode, xmlDoctype: DocType = XMLDocType.XML_UTF8): string {
    const log = debug('expresso:render:xml')
    log('start')
    const dom = _renderXML(xml, {doctype: xmlDoctype})
    log('rendered XML')
    return dom
}

export type DocType = HTMLDocType | XMLDocType;

export enum HTMLDocType {
    // Modern HTML5 document type header
    HTML5 = `<!DOCTYPE html>`,
    // Old HTML4 document type header, for those poor developers that need it
    HTML4 = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">`,
}

export enum XMLDocType {
    XML_UTF8 = `<?xml version="1.0" encoding="UTF-8"?>`,
    XML = `<?xml version="1.0" encoding="UTF-8"?>`, // XML_UTF8
}

export function json(res: Response, data: unknown): void {
    res.setHeader('content-type', 'application/json')
    res.json(data);
}

export function document<D = {}>(res: Response, jsx: VNode, data?: D, doctype: HTMLDocType | string = HTMLDocType.HTML5): void {
    res.send(doctype + renderJSX(jsx, data))
}

export function xml(res: Response, xml: JSXNode, doctype: XMLDocType = XMLDocType.XML_UTF8): void {
    res.setHeader('content-type', 'application/xml')
    res.send(renderXML(xml, doctype));
}

