import { Socket, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Notification from "../models/Notification";
import User from "../models/User";

export const followUser = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    return socket.on('follow user', async ({ followerId, userId }) => {
        const message = "Something went wrong";
        if (!followerId && !userId) {
            return console.log({ message })
        }

        try {
            const followerUser = await User.findById(followerId).where('followings').nin([userId])
            const user = await User.findById(userId).where('followers').nin([followerId])

            if (!followerUser || !user) {
                return console.log({ message })
            }

            user.followers.push(followerId)
            followerUser.followings.push(userId)
            
            await user.save()
            await followerUser.save()

            io.to(followerId).emit('follow user', followerUser._id )

            // create notification
            const newNotification = new Notification({
                action: 'followingUser',
                user: userId,
                user2: followerId,
                message: `${followerUser.username} has followed you`
            })

            const notification = await (await newNotification.save()).populate('user2', '_id picture')
            console.log(notification)
            io.to(userId).emit('get followed', notification)
        } catch (error) {
            console.log(error)
            console.log({ message })
        }
    })
}

export const unfollowUser = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    return socket.on('unfollow user', async ({ unfollowerId, userId }) => {
        const message = "Something went wrong"
        if (!unfollowerId || !userId) {
            return console.log(message)
        }

        try {
            const unfollowerUser = await User.findById(unfollowerId).where('followings').in([userId])
            const user = await User.findById(userId).where('followers').in([unfollowerId])

            if (!unfollowerUser || !user) {
                return console.log(message)
            }

            unfollowerUser.followings.pull(userId)
            user.followers.pull(unfollowerUser)

            await unfollowerUser.save()
            await user.save()

            await Notification.deleteOne({ user: userId, user2: unfollowerId, action: 'followingUser' })

            io.to(unfollowerId).emit('unfollow user', unfollowerUser._id)
        } catch (error) {
            console.log(error)
        }
    })
}

export const getLikeNotification = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    return socket.on('like post notification', async ({ user, post }) => {
        if (user._id === post.creator) return;

        try {
           await Notification.deleteMany({ user: post.creator, user2: user._id, post: post._id })
           
            const newNotification = new Notification({
                user: post.creator,
                user2: user._id,
                message: `${user.username} has liked your post`,
                action: 'likingPost',
                post: post._id
            })
            const notification = await newNotification.save()
            const data = { 
                ...notification._doc,
                post: { _id: post._id, creator: post.creator, media: post?.media },
                user2: { _id: user._id, picture: user.picture }
            }
            io.to(post.creator).emit('like post notification', data)
        } catch (error) {
            console.log(error)
        }
        
    })
}