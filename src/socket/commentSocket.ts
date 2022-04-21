import { Socket, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Comment from "../models/Comment";
import Notification from "../models/Notification";
import Post from "../models/Post";

export const makeComment = (socket: Socket, io: Server<DefaultEventsMap, DefaultEventsMap, any>) => {
    socket.on('make comment', async ({ postId, userId, content }) => {
        if (!userId || !postId || !content) {
            return console.log('Some field is missing');
        }

        if (content.length > 500) return console.log('Content must be less than 500 characters');

        try {
            const post = await Post.findById(postId);
            if (!post) return console.log('Post not found');
            const newComment = new Comment({
                user: userId, post: postId, content
            })
            const comment = await (await newComment.save()).populate('user', '_id name username picture');
            socket.emit('make comment', comment)
            post.comments = post.comments + 1;
            await post.save();
        } catch (error) {
            console.log(error);
        }
    })
}