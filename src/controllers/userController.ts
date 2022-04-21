import User from "../models/User";
import { Request, Response, NextFunction } from "express";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";
import { uploadProfilePictures } from "../utils/uploads";
import PasswordHandler from "../utils/passwords";

const scrypt = new PasswordHandler()

const upload = uploadProfilePictures.single('profile-picture')

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { search, all } = req.query

    try {
        let users = [];
        if (!search && !all) {
            users = []
        }
        if (all && !search) {
            users = await User.find()
        }
        if (!all && search) {
            users = await User.find().or([
                { username: new RegExp('^' + search, 'i') },
                { name: new RegExp('^' + search, 'i') }
            ])
        }
        res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        next({})
    }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    if (!userId) {
        return next({})
    }
    try {
        await User.findByIdAndDelete(userId)
        res.sendStatus(204)
    } catch (error) {
        next({})
    }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    
    try {
        const user = await User.findById(userId).select('-password')
        if (!user) {
            return next({ statuscode: 404, message: "User not found" })
        }

        const followings = user.followings.length;
        const followers = user.followers.length;
        const userResponse = {
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            description: user.description,
            picture: user.picture,
            followings,
            followers
        }
        res.status(200).json({
            success: true,
            user: userResponse
        })
    } catch (error) {
        next({})
    }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const fields = ['username', 'name', 'email', 'description']
    const data = req.body
    const { userId } = req.params
    let newData: any = {};

    for (let key in data) {
        if (!fields.includes(key)) return;
        newData[key] = data[key]
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, newData, { new: true })
        const accessToken = generateAccessToken(updatedUser)
        const refreshToken = generateAccessToken(updatedUser)
        res.status(200).json({
            success: true,
            user: updatedUser,
            accessToken, refreshToken
        })
    } catch (error) {
        next({})
    }
}

export const updateUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword, newConfirmingPassword } = req.body
    const { userId } = req.params
    if (!currentPassword || !newPassword || !newConfirmingPassword || !userId) {
        return next({ statuscode: 400 })
    }
    if (newPassword.length < 6) {
        return next({ statuscode: 400, message: "Your password must be at least 6 characters" })
    }
    if (newPassword !== newConfirmingPassword) {
        return next({ statuscode: 400, message: "Confirm your password" })
    }

    try {
        const user = await User.findById(userId)
        const isMatch = scrypt.comparePassword(currentPassword, user.password)
        if (!isMatch) return next({ statuscode: 400, message: "Your current password is wrong" })
        user.password = scrypt.hashPassword(newPassword)
        await user.save()
        res.sendStatus(204)
    } catch (error) {
        next({})
    }
}

export const uploadProfilePicture = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, async function(err) {
        if (err) {
            return next({ message: "Something went wrong while uploading the picture" })
        }
        const { userId } = req.params;
        const user = await User.findById(userId)
        if (!user) return next({ statuscode: 404, message: "User not found" });
        const { path } = req.file!
        user.picture = path;
        await user.save();
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        res.status(200).json({
            success: true,
            accessToken, refreshToken
        })       
    })
}

export const getUserContact = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, type } = req.params;

    if (!userId || !type) {
        return next({})
    }
    if (!(type === "followings" || type === "followers")) {
        return next({ statuscode: 400 })
    }
    try {
        /**
         * i did reverse because if i want go get my followers i'll be looking in their followings list
         */
        let userType = type === "followers" ? "followings" : "followers"
        const users = await User.find({
            [userType]: { $in: [userId] }
        }).select('_id picture username name followings followers')
        res.status(200).json({
            success: true,
            type,
            [type]: users
        })

    } catch (error) {
        console.log(error)
        next({})
    }

}

export const getMyFollowings = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    if (!userId) return next({ statuscode: 400 })
    try {
        const user = await User.findById(userId).select('-password');
        if (!user) return next({ statuscode: 404, message: "User not found" })
        const followings = user.followings;
        res.status(200).json({
            success: true,
            followings
        })
    } catch (error) {
        console.log(error)
        next({})
    }
}