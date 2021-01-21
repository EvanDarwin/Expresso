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
