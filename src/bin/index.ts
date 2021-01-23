/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import * as minimist from "minimist";
import {testConnections} from "./lib";

const argv = minimist(process.argv.slice(2))
const [subcommand] = argv._

declare module "minimist";

function help(): never {
    console.log([
        `expresso - An express framework\n---\n`,
        'Commands:',
        `\tcompile\t\tCompile static assets`,
        '\ttest\t\tTest connection details',
    ].join('\n'))
    process.exit(2);
}

if (!subcommand) {
    help();
}

switch (subcommand.toLowerCase()) {
    case "test":
        // verify that connections are working
        testConnections()
            .then(() => process.exit(0))
            .catch((e) => {
                console.error(e);
                process.exit(1)
            });
}

