import {ConfigSetDataSimple} from "../core";

/**
 * The configuration object that is held internally
 */
export interface ExpressoConfiguration<CK = ConfigKeys> {
    __secret: Map<CK, string | boolean | number | undefined>;
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

export type ExpressoEnv<CK> = <T>(key: CK, defaultValue?: T) => T | undefined;

export interface ExpressoOptions<E = ConfigSetDataSimple> {
    env?: E;
}
