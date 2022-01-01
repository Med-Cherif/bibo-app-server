import User from "../models/User";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt"

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
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        next({})
    }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const fields = ['username', 'gender', 'name', 'country', 'birthday', 'email']
    const { userId, ...data } = req.body
    let newData: any = {};

    for (let key in data) {
        if (fields.includes(key)) {
            newData[key] = data[key]
        }
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, newData, { new: true })
        res.status(200).json({
            success: true,
            user: updatedUser
        })
    } catch (error) {
        next({})
    }
}

export const updateUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword, newConfirmingPassword, userId } = req.body
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
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) return next({ statuscode: 400, message: "Your current password is wrong" })
        user.password = newPassword
        await user.save()
        res.sendStatus(204)
    } catch (error) {
        next({})
    }
}