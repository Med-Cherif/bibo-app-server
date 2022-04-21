import { Request, Response, NextFunction } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
    const { postID } = req.params;

    if (!postID) return next({ statuscode: 404, message: "Post ID not found" })

    try {
        const comments = await Comment.find({
            post: postID
        }).sort({ createdAt: -1 })
        .populate('user', '_id name username picture')
        .populate('post', '_id creator')

        res.status(200).json({
            success: true,
            comments
        })
    } catch (error) {
        next({})
    }
}

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    const { commentId } = req.params;

    if (!commentId) return next({ statuscode: 404, message: "Comment not found" })

    try {
        const comment = await Comment.findById(commentId);
        const post = await Post.findById(comment.post);
        await comment.delete();
        res.sendStatus(204);
        post.comments = post.comments - 1;
        await post.save()
    } catch (error) {
        next({})
    }
}