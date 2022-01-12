import { Request, Response, NextFunction } from "express";
import Notification from "../models/Notification";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    if (!userId) return next({ statuscode: 404 })
    
    try {
        const notifications = await Notification.find({ user: userId }).sort('-createdAt').limit(20).populate('user2', '_id picture').populate('post', '_id creator media');
        res.status(200).json({
            success: true,
            notifications
        })
    } catch (error) {
        next({})
    }
}