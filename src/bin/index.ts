#!/usr/bin/env node

/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import * as ansiColors from "ansi-colors";
import * as minimist from "minimist";
import {Logger} from "tslog";

// eslint-disable-next-line @typescript-eslint/no-var-requires,security/detect-non-literal-require
const {compileSass, testConnections} = require(__dirname + "/lib");

const argv = minimist(process.argv.slice(2))
const [subcommand] = argv._

declare module "minimist";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const VERSION = require("../../package.json").version;

function help(): never {
    console.log([
        `${ansiColors.yellow("expresso " + VERSION)} :: ${ansiColors.gray("An express framework")}`,
        ansiColors.yellow(`---\n`),
        ansiColors.underline.green('Commands:'),
        ...Object.entries({
            "db:test": "Test database connection details",
            "db:sync": "Synchronize database schema",
            "compile:sass": "Compile SASS",
        }).map(([k, v]) => `  ${ansiColors.cyan(k.padEnd(15, ' '))}${ansiColors.whiteBright(v)}`),
        ''
    ].join('\n'))
    process.exit(2);
}

if (!subcommand) {
    help();
}

const log = new Logger({displayFunctionName: false});
switch (subcommand.toLowerCase()) {
    case "db:test":
        // verify that connections are working
        testConnections(log)
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
        break;
    case "db:sync":
        // TODO: Sync DB
        break;
    case "compile:sass":
        compileSass(log)
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
        break;
    default:
        help();
}

