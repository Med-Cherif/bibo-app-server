import { Schema, model } from "mongoose";

const messageSchema = new Schema({
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    seen: { type: Boolean },
    createdAt: { type: Date, default: Date.now }
})

const chatSchema = new Schema({
    joinedUsers: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    starter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    accepted: { type: Boolean, default: false },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
})

export const Message = model('Message', messageSchema)
export const Chat = model('Chat', chatSchema)