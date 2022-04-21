import { Response, Request, NextFunction } from "express"

export const errorsResponse1 = (req: Request, res: Response, next: NextFunction) => {
    console.log("The API URI is not valid");
    res.status(500).json({ message: "The API URI is not valid" })
}

export const errorsResponse2 = (err: any, req: Request, res: Response, next: NextFunction) => {
    let error = {
        message: "Something went wrong",
        statuscode: 500
    }

    if (err?.message) {
        error.message = err.message
    }

    if (err?.statuscode) {
        error.statuscode = err.statuscode
    }

    res.status(error.statuscode).json({
        success: false,
        message: error.message
    })
}