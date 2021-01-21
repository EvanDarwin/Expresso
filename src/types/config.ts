import {Express} from "express";
import {ConfigSetDataSimple} from "../core";

export interface ExpressoConfiguration<CK = ConfigKeys> {
    __secret: Map<CK, string | boolean | number | undefined>;
}

export interface EnvConfigData<T = unknown> {
    required?: boolean;
    default?: string | number | boolean;
    filter?: (value: unknown) => T | undefined;
    verify?: (value: T | unknown) => void | never;
}

export type ConfigKeys = 'APP_SECRET' | 'APP_ENV' | 'APP_DEBUG';

export type ExpressoEnv<CK> = <T>(key: CK, defaultValue?: T) => T | undefined;

export interface Expresso<CK = ConfigKeys> extends Express {
    env: ExpressoEnv<CK>;
    debug: boolean;
}

export interface ExpressoOptions<E = ConfigSetDataSimple> {
    env?: E;
}
