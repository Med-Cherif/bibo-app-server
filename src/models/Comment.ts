import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
})

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;