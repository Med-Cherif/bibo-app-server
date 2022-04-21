import { Request, Response, NextFunction } from "express";
import Notification from "../models/Notification";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    if (!userId) return next({ statuscode: 404 })
    
    try {
        const notifications = await Notification.find({ user: userId }).sort('-createdAt')
            .populate('user2', '_id picture')
            .populate('post', '_id creator media')
            .populate('comment', '_id user content');
        res.status(200).json({
            success: true,
            notifications
        })
    } catch (error) {
        next({})
    }
}