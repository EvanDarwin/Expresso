import debug from "debug";
import {Connection, ConnectionOptions, ConnectionOptionsReader, createConnection} from "typeorm";

// Load pretty errors

export * from "./app";
export * as middleware from "./middleware"
export * from "./config";
export * from "./render";
export * from "./response";


/**
 * Begin the connection to the database service(s)
 *
 * @returns {Promise<Connection>} The primary database service
 */
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


