import { unlink } from "fs";
import { resolve } from "path";
import { NextFunction, Request, Response } from "express";
import Post from "../models/Post";
import User from "../models/User";
import { uploadPostImages } from "../utils/uploads";

const upload = uploadPostImages.single('post-media')

export const createPost = async (req: Request, res: Response, next: NextFunction) => {

    const { hasFile } = req.query;
    
    
    if (hasFile) {
        upload(req, res, async function (err) {
            if (err) return next({ statuscode: 400, message: "Something went wrong while uploading the file" })
            const { creator, content } = req.body;
            if (!creator || (!content && !req.file)) {
                return next({ statuscode: 400, message: 'You are missing something' })
            }
            let postData: any = {
                creator,
            }
            if (content) {
                postData = {
                    ...postData,
                    content,
                }
            }
            if (req.file) {
                postData = {
                    ...postData,
                    media: {
                        path: req.file.path,
                        mimetype: req.file.mimetype
                    }
                }
            }
            try {
                let newPost = new Post(postData);
                const post = await (await newPost.save()).populate({
                    path: 'creator', select: '_id username name picture'
                })
                res.status(201).json({
                    success: true,
                    post
                })
            } catch (error) {
                console.log(error);
                next({})
            }
            

        })
    } else {
        const { creator, content } = req.body;
        if (!creator || !content) {
            return next({ statuscode: 400, message: "You are missing something" })
        }
        try {
            let newPost = new Post({
                creator,
                content
            });
            const post = await (await newPost.save()).populate({
                path: 'creator', select: '_id username name picture'
            })
            res.status(201).json({
                success: true,
                post
            })
        } catch (error) {
            console.log(error);
            next({})
        }

    }    

}

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    if (!postId) {
        return next({})
    }

    try {

        const post = await Post.findById(postId);
        if (typeof post.media?.path === "string" && post.media?.path.length > 0) {
            const path = resolve(post.media.path);
            unlink(path, (err) => {
                if (err) return console.log(err);
            });
        }
        await post.delete()
        res.sendStatus(204)
    } catch (error) {
        next({})
    }
}

export const getPublicPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    if (!userId) return next({ statuscode: 404 })
    try {
        const user = await User.findById(userId)
        const posts = await Post.find({ 
            $or: [
                { creator: userId },
                { creator: { $in: user.followings }}]
            })
            .sort({ createdAt: -1 })
            .populate('creator', '_id username picture name')

        res.status(200).json({
            success: true,
            posts
        })
    } catch (error) {
        next({})
    }

}

export const getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    if (!userId) return next({ statuscode: 404 })
    try {
        const posts = await Post.find({ creator: userId })
            .sort({ createdAt: -1 })
            .populate('creator', '_id username picture name')
        res.status(200).json({
            success: true, 
            posts
        })
    } catch (error) {
        next({})
    }
}

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params
    if (!postId) return next({ statuscode: 404 })
    try {
        const post = await Post.findById(postId).populate('creator', '_id username name picture')
        if (!post) return next({ statuscode: 404, message: "Post not found" })
        res.status(200).json({
            success: true, 
            post
        })
    } catch (error) {
        next({})
    }
}

export const likeAndUnlikePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId, userId } = req.body

    if (!postId || !userId) return next({ statuscode: 404 })
    let type: string;

    try {
        const user = await User.findById(userId)
        if (!user) return next({ statuscode: 404, message: "User not found" })

        let post = await Post.findById(postId)
        if (!post) return next({ statuscode: 404, message: "Post not found" })

        if (post.likes.includes(user._id)) {
            post.likes.pull(userId)
            type = 'unlike'
        } else {
            post.likes.push(userId)
            type = 'like'
        }
        
        post.dislikes.pull(userId)

        await post.save()

        res.status(200).json({
            success: true,
            postId,
            post,
            userId,
            type
        })        

    } catch (error) {
        next({})
    }
}

export const dislikeAndUndislikePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId, userId } = req.body

    if (!postId || !userId) return next({ statuscode: 404 })
    let type: string;

    try {
        const user = await User.findById(userId)
        if (!user) return next({ statuscode: 404, message: "User not found" })

        let post = await Post.findById(postId)
        if (!post) return next({ statuscode: 404, message: "Post not found" })

        if (post.dislikes.includes(user._id)) {
            post.dislikes.pull(userId)
            type = 'undislike'
        } else {
            post.dislikes.push(userId)
            type = 'dislike'
        }
        
        post.likes.pull(userId)

        await post.save()

        res.status(200).json({
            success: true,
            postId,
            userId,
            type
        })        

    } catch (error) {
        next({})
    }
}

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const { newContent } = req.body;
    if (!postId || !newContent) return next({ statuscode: 404 })
    try {
        const post = await Post.findById(postId)
        if (!post) return next({ statuscode: 404, message: "Post not found" })
        post.content = newContent
        await post.save()
        res.sendStatus(204)
    } catch (error) {
        next({})
    }
}