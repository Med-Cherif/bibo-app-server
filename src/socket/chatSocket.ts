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

            const accepted = {
                isAccepted: chat.accepted,
                receiver: chat.receiver
            }

            io.to(starterId).emit('start exixts chat', { user, messages, accepted })
            
        } catch (error) {
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
                const newChat = new Chat({ 
                    joinedUsers: [senderId, toId], 
                    starter: senderId, 
                    receiver: toId
                })
                const chat = await (await newChat.save())
                    .populate('starter', '_id username picture')
                    // .populate('lastMessage', '_id content createdAt')

                const newMessage = new Message({ sender: senderId, chatId: chat._id, content })
                const message = await newMessage.save()
                chat.lastMessage = message
                await (await chat.save()).populate('joinedUsers', '_id username picture');

                socket.join(chat._id.toString())
                io.to(toId).emit('receiver new chat', chat)
                return io.to(senderId).emit('create chat', { chat, message });
            }
            const message = await Message.create({
                sender: senderId, chatId, content
            })
            io.to(chatId).emit('receive message', message)
            const chat = await Chat.findById(chatId);
            chat.lastMessage = message;
            await (await chat.save()).populate('joinedUsers', '_id username picture');
            io.to(chat.starter.toString()).to(chat.receiver.toString()).emit('receive chat', chat);

        } catch (error) {
            return cb({ error: "Something went wrong" })

        }
    })
}

export const onWriteMessage = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, any>) => {
    return socket.on('on write message', ({ userID, chatID }) => {
        io.to(userID).emit('on write message', chatID);
    })
}

export const onEndWriteMessage = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, any>) => {
    return socket.on('on end write message', ({ userID, chatID }) => {
        io.to(userID).emit('on end write message', chatID);
    })
}

export const seenMessage = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, any>) => {
    return socket.on('seen message', async ({chatID, messageID, userID}) => {
        io.to(userID).emit('seen message', {chatID, messageID});
        
        try {
            const updateData: any = { seen: true }
            await Message.findByIdAndUpdate(messageID, updateData); 
        } catch (error) {
            
        }

    })
}