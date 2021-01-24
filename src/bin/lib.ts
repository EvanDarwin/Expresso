/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import * as ansi from "ansi-colors";
import * as ansiColors from "ansi-colors";
import * as fs from "fs";
import * as path from "path";
import {Logger} from "tslog";
import {connect} from "../core";

export async function testConnections(log: Logger): Promise<void> {
    log.info(ansi.whiteBright("Initiating ORM connection..."))
    return await connect().then(async DB => {
        log.info(ansi.greenBright(`Connected to ${ansi.underline.yellowBright(DB.options.type)}!`))
        await DB.close();
    }).catch(e => {
        log.fatal(ansi.redBright(`Failed to connect to the database. Please check your ${
            ansi.underline.yellowBright('ormconfig.json')}.`))
        return Promise.reject(e)
    });
}

export async function compileSass(log: Logger): Promise<void> {
    const possibleExtensions = ['.sass', '.scss', '.css'];
    let foundFile: string | undefined;
    const tried: string[] = [];

    for (const ext of possibleExtensions) {
        const filename = path.resolve(process.cwd(), 'sass', 'app' + ext)
        tried.push(filename)
        let valid = false;
        try {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            valid = fs.existsSync(filename)
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            if (!valid) valid = fs.statSync(filename).isFile()
        } catch (e) {
            // ignore
        }
        if (valid) {
            foundFile = filename;
            break;
        }
    }

    if (!foundFile) {
        const e = new Error([
            `Unable to compile SASS stylesheet. (no files available)\n`,
            ansiColors.white(`  Attempted Paths:`),
            ...tried.map(fp => `    ${ansiColors.gray("-")} ${ansiColors.underline.yellowBright(fp)}`), ''
        ].join('\n'))
        log.error(e)
        return;
    }

    log.info(ansi.whiteBright(`Compiling ${ansi.yellowBright.underline(foundFile)}`))
}
