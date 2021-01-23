/**
 * == Expresso Framework ==
 *
 * This is free software, licensed under the GPL-3.0-or-later license; whose
 * full text is available in the LICENSE file included with this code. You are
 * welcome to redistribute and contribute to it under certain conditions.
 *
 * @copyright 2021 - Evan Darwin <evan@relta.net>
 */

import {NextFunction, RequestHandler} from "express";

export function asyncHandler(fn: RequestHandler): RequestHandler {
    return (...args: Parameters<RequestHandler>) => {
        const ret = fn(...args)
        const next: NextFunction | undefined = args.slice(-1, 1) as unknown as NextFunction
        if (!next) {
            throw new Error("Internal error, 'next' function not found")
        }
        return Promise.resolve(ret).catch(next)
    }
}
