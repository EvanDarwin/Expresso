/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import debug from "debug";
import {Logger} from "tslog";
import {Connection, ConnectionOptions, ConnectionOptionsReader, createConnection} from "typeorm";

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
        (new Logger({displayFunctionName: false})).error(e)
        process.exit(1);
    });
}
