import { Request, Response, NextFunction } from "express";
import { Chat, Message } from "../models/Chat";
import { sortChats } from "../utils/helpers";

export const getChats = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params

    try {
        const chats = await Chat.find({ joinedUsers: { $in: [userId] } })
            .populate('joinedUsers', '_id username picture')
            .populate('lastMessage', 'sender content createdAt')
            
        const sortedChats = sortChats(chats)

        res.status(200).json({
            success: true, chats: sortedChats
        })
    } catch (error) {
        next({})
    }
}

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    const { chatId, user } = req.params
    try {
        const messages = await Message.find({ chatId }).sort('+createdAt')
        res.status(200).json({
            success: true, messages
        })
    } catch (error) {
        next({})
    }
}