import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: String,
    media: {
        path: String,
        mimetype: String
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: { type: Number, default: 0 }
}, {
    timestamps: true
})

const Post = mongoose.model('Post', postSchema)

export default Post