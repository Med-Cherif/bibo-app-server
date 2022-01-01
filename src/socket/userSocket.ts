import { Socket, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
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
            io.to(userId).emit('get followed', followerUser.username)
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

            console.log(unfollowerUser)
            console.log(user)

            if (!unfollowerUser || !user) {
                return console.log(message)
            }

            unfollowerUser.followings.pull(userId)
            user.followers.pull(unfollowerUser)

            await unfollowerUser.save()
            await user.save()

            io.to(unfollowerId).emit('unfollow user', unfollowerUser._id)
        } catch (error) {
            console.log(error)
        }
    })
}