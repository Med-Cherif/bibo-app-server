import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization
    if (!token) {
        return next({ statuscode: 401 })
    }
    token = token.split(' ')[1]
    if (!token) {
        return next({ statuscode: 401 })
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!, function(err, decoded){
        if (err) {
            return next({ statuscode: 403 })
        }
        if (decoded) {
            if (decoded.isAdmin) {
                (req as any).user = decoded;
                (req as any).isAdmin = true;
                next()
            } else {
                return next({ statuscode: 403 })    
            }
        } else {
            return next({})
        }
    })
}

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization
    if (!token) {
        return next({ statuscode: 401 })
    }
    token = token.split(' ')[1]
    if (!token) {
        return next({ statuscode: 401 })
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET!, function(err, decoded){
        if (err) {
            return next({ statuscode: 403 })
        }
        if (decoded) {
            (req as any).user = decoded;
            next()
        } else {
            return next({})
        }
    })
}

// only the admin and the user with that id who can do it
export const isAllowed = (req: Request, res: Response, next: NextFunction) => {    
    const { user: { _id }, body, params } = req as any;
    let userId: string | null;

    if (!_id) {
        return next({ statuscode: 401 })
    }

    if (params?.userId) {
        userId = params.userId
    } else if (body?.userId) {
        userId = body.userId
    } else {
        return next({ statuscode: 404 })
    }

    if (userId === _id) {
        return next()
    }

    next({ statuscode: 403 })

}