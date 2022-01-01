import { Socket, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Chat, Message } from "../models/Chat";
import User from "../models/User";

export const startChat = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, any>) => {
    return socket.on('start chat', async ({ starterId, userId }, cb: any) => {
        if (!starterId || !userId) {
            return cb({ error: 'Something went wrong' })
        }
        try {
            const starterUser = await User.findById(starterId).select('_id username picture name')
            const user = await User.findById(userId).select('_id username picture name')

            if (!starterUser || !user) {
                return cb({ error: "User not found" })
            }

            let chat = await Chat.findOne({ joinedUsers: { $all: [starterId, userId] } })
            if (!chat) {
                return io.to(starterId).emit('start new chat', { user })
            }

            socket.join(chat._id.toString())

            const messages = await Message.find({ chatId: chat._id }).sort('createdAt')
            io.to(starterId).emit('start exixts chat', { user, messages })
            
        } catch (error) {
            console.log(error)
            cb({ error: 'Something went wrong' })
        }
    })
}

export const handleMessage = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, any>) => {
    return socket.on('send message', async ({ content, senderId, toId, chatId }, cb: any) => {
        if (!senderId || !content) {
            return cb({ error: "Something went wrong" })
        }
        
        try {
            if (!chatId) {
                const newChat = new Chat({ joinedUsers: [senderId, toId] })
                const chat = await newChat.save()
                const newMessage = new Message({ sender: senderId, chatId: chat._id, content })
                const message = await newMessage.save()
                chat.lastMessage = message
                await chat.save()
                socket.join(chat._id.toString())
                return io.to(senderId).emit('create chat', { message })
            }
            const message = await Message.create({
                sender: senderId, chatId, content
            })
            await Chat.findByIdAndUpdate(chatId, { lastMessage: message })
            io.to(chatId).emit('receive message', message)

        } catch (error) {
            console.log(error)
            return cb({ error: "Something went wrong" })

        }
    })
}