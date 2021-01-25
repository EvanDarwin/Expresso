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
import * as fs from "fs";
import * as path from "path";
import * as sass from "sass";
import {Logger} from "tslog";
import {Connection} from "typeorm";

// eslint-disable-next-line @typescript-eslint/no-var-requires,security/detect-non-literal-require
const {connect} = require(path.resolve(__dirname, "../core/index.js"));

export async function testConnections(log: Logger): Promise<void> {
    log.info(ansi.whiteBright("Initiating ORM connection..."))
    return await connect().then(async (DB: Connection) => {
        log.info(ansi.greenBright(`Connected to ${ansi.underline.yellowBright(DB.options.type)}!`))
        await DB.close();
    }).catch((e: unknown) => {
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
            ansi.white(`  Attempted Paths:`),
            ...tried.map(fp => `    ${ansi.gray("-")} ${ansi.underline.yellowBright(fp)}`), ''
        ].join('\n'))
        log.error(e)
        return;
    }

    log.info(ansi.whiteBright(`Compiling ${ansi.yellowBright.underline(foundFile)}`))
    const compiledSassBody = sass.renderSync({file: foundFile, outputStyle: "compressed"})
    const staticDir = path.resolve(process.cwd(), 'static');
    const outputFilePath = path.resolve(staticDir, 'app.css');
    log.info(ansi.whiteBright(`Writing ${ansi.yellowBright.underline(outputFilePath)}`));
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(outputFilePath, compiledSassBody.css);
    log.info(ansi.greenBright(`Compiled successfully!`))
}
