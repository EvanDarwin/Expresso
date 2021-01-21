import debug from "debug";
import {config as configEnv} from "dotenv";
import {ConfigKeys, EnvConfigData, ExpressoConfiguration} from "../types";
import {strEntropy} from "../ext/entropy";

export type ConfigSetDataSimple = { [key: string]: EnvConfigData };
export const DefaultConfigSet: { [K in ConfigKeys]: EnvConfigData } = {
    APP_SECRET: <EnvConfigData<string>>{
        required: true,
        filter: (v) => (`${v || ''}`),
        verify: (secret): void | never => {
            if (typeof secret !== 'string') { // noinspection ExceptionCaughtLocallyJS
                throw new Error("Invalid / no value was provided");
            }

            if (strEntropy(secret) < 128) { // noinspection ExceptionCaughtLocallyJS
                throw new Error("Your provided secret key does not contain enough entropy, please choose a more secure string")
            }
        }
    },
    APP_ENV: <EnvConfigData<string>>{
        required: false,
        default: "local",
    },
    APP_DEBUG: <EnvConfigData<boolean>>{
        default: false,
        filter: (v) => !!(v && (['true', '1'].includes(`${v}`.toLowerCase()))),
    }
}

const noop = <R>(s: R): R => s;

export function readConfiguration<K = ConfigKeys>(customKeys?: { [key: string]: EnvConfigData }): ExpressoConfiguration<K> | never {
    configEnv();

    const configMap = new Map<K, unknown>();
    const log = debug('expresso:config')
    log('verify environment')

    const mergedConfigSet = Object.assign({}, DefaultConfigSet, customKeys || {})
    for (const [key, data] of Object.entries(mergedConfigSet)) {
        if (!key.match(/[A-Z\d_]+/)) {
            throw new Error(`Invalid environment key '${key}'`)
        }

        // eslint-disable-next-line security/detect-object-injection
        const envValue = process.env[key];
        if (data.required && typeof data.default === 'undefined' && typeof envValue === 'undefined') {
            throw new Error(`You did not provide a value for the '${key}' environment variable, but is required.`)
        }
        let res;
        if (data.default && typeof envValue === 'undefined') {
            res = data.default;
        } else {
            res = (data.filter ? data.filter : noop)(envValue);
        }
        configMap.set(key as unknown as K, res)
    }

    log('ready')
    return <ExpressoConfiguration<K>>{__secret: configMap}
}
