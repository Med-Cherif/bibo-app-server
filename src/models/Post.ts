import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: String,
    media: String,
}, {
    timestamps: true
})

const Post = mongoose.model('Post', postSchema)

export default Post