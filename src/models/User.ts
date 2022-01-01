import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, match: /^[a-z0-9_\.]+$/},
    email: { type: String, required: true, unique: true, match: /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i},
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true },
    gender: { type: String, required: true, enum: ['male', 'female', 'prefer not to say']},
    followings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    birthday: { type: Date, required: true },
    picture: { type: String, default: '/profile-pictures/default-profile-picture.png' },
    country: String,
    description: { type: String, maxlength: 150 }
}, {
    timestamps: true
})

userSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

const User = mongoose.model('User', userSchema)

export default User