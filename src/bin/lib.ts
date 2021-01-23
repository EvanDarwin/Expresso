/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import {connect} from "../core";

export function testConnections(): Promise<void> {
    console.log("Testing database connection")
    return connect().then(DB => {
        console.log("Connected to " + DB.options.type + "!")
    });
}
