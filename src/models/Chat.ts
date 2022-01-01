import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true }
}, {
    timestamps: true
})

const chatSchema = new mongoose.Schema({
    joinedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
}, {
    timestamps: true
})

export const Message = mongoose.model('Message', messageSchema)
export const Chat = mongoose.model('Chat', chatSchema)