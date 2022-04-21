import { Request, Response, NextFunction } from "express";
import { Chat, Message } from "../models/Chat";
import { sortChats } from "../utils/helpers";

export const getChats = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    
    const skip = Number(req.query.skip);
    const limit = Number(req.query.limit);

    try {
        const chats = await Chat.find({ 
            joinedUsers: { $in: [userId] },
        }).or([
            { starter: userId },
            {
                $and: [
                    { starter: { $ne: userId } },
                    { accepted: true }
                ]
            }
        ])
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

export const getRequestedChats = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
        const chats = await Chat.find({ 
            receiver: userId,
            accepted: false,
        })
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

export const acceptChat = async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params;
    if (!chatId) return next({ statuscode: 400, message: "Chat id not found" })
    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return next({ statuscode: 404, message: "Chat not found" })
        chat.accepted = true;
        await chat.save();
        res.sendStatus(204)
    } catch (error) {
        next({})
    }
}

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.params
    try {
        const messages = await Message.find({ chatId }).sort('+createdAt')
        res.status(200).json({
            success: true, messages
        })
    } catch (error) {
        next({})
    }
}