/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import {RequestHandler} from "express";
import {Expresso} from "../types";

/** Automatically handle asynchronous functions in express handlers */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asyncHandler = (app: Expresso<any>, fn: RequestHandler): RequestHandler =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(e => next(e))
    }
