import { Request, Response, NextFunction } from "express"
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";
import { userSchema } from "../utils/validate";
import PasswordHandler from "../utils/passwords";

const scrypt = new PasswordHandler();

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { username, name, email, password, confirmPassword, birthday, gender, country } = req.body
    const data = {username, name, email, password, confirmPassword, birthday, gender, country}
    const { error } = userSchema.validate(data)
    if (error) {
        return next({ statuscode: 400 })
    }

    try {
        let existsUser = await User.findOne({ email })
        if (existsUser) return next({ message: 'E-mail already in use', statuscode: 409 })
        existsUser = await User.findOne({ username })
        if (existsUser) return next({ message: 'Username already in use', statuscode: 409 })
        const hashedPassword = scrypt.hashPassword(password)
        const newUser = new User({ ...data, password: hashedPassword, birthday: new Date(birthday.split('/').reverse().join('/')) })
        const user = await newUser.save()

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        res.status(201).json({
            success: true,
            accessToken, refreshToken
        })

    } catch (error) {
        next({})
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { perferredSocial, password } = req.body
    
    if (!perferredSocial || !password) {
        return next({ statuscode: 400 })
    }
    
    try {
        const user = await User.findOne().or([{ username: perferredSocial }, { email: perferredSocial }])
        if (!user) return next({ statuscode: 404, message: "Invalid credentials" })

        const isPasswordMatch = scrypt.comparePassword(password, user.password);

        if (!isPasswordMatch) return next({ statuscode: 404, message: "Invalid credentials" })

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        res.status(200).json({
            success: true,
            accessToken, refreshToken
        })

    } catch (error) {
        
        next({})
    }
}