/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import {ConfigSetDataSimple} from "../core";

/**
 * The configuration object that is held internally
 */
export interface ExpressoConfiguration<CK = ConfigKeys> {
    __secret: Map<CK, string | boolean | number | undefined>;
    generators: {
        requestID: () => string;
    }
}

/**
 * Configuration settings for parsing a given environment variable
 */
export interface EnvConfigData<T = unknown> {
    required?: boolean;
    default?: string | number | boolean;
    filter?: (value: unknown) => T | undefined;
    verify?: (value: T | unknown) => void | never;
}

export type ConfigKeys = 'APP_SECRET' | 'APP_ENV' | 'APP_DEBUG';

export type ExpressoEnv<CK> = <T>(key: CK | string, defaultValue?: T) => T;

export interface ExpressoOptions<E = ConfigSetDataSimple> {
    env?: E;
    trustProxy?: string | number;
    getRequestID?: () => Promise<string> | string;
}
