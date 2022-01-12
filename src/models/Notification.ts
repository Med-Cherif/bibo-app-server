import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    // you
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // the one who will follow your or like your post
    user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    message: { type: String, required: true },
    action: {
        type: String,
        enum: ['likingPost', 'followingUser']
    },
    post: {
        required: function() {
            return (this as any).action === 'likingPost'
        },
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification