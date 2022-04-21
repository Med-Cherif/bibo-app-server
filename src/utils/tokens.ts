import jwt from "jsonwebtoken";

interface Payload {
    _id: any,
    username: string,
    name: string,
    email: string,
    picture: string,
}

function jwtPayload(payload: any) {
    return {
        _id: payload._id,
        username: payload.username,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        description: payload.description
    }
}

export const generateAccessToken = (payload: Payload): string => {
    const data = jwtPayload(payload)
    return jwt.sign(data, process.env.JWT_ACCESS_TOKEN_SECRET!, {
        expiresIn: "365d"
    })
}

export const generateRefreshToken = (payload: Payload): string => {
    const data = jwtPayload(payload)
    return jwt.sign(data, process.env.JWT_REFRESH_TOKEN_SECRET!, {
        expiresIn: "365d"
    })
}