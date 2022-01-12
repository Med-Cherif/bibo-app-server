import { NextFunction, Request, Response } from "express";
import Post from "../models/Post";
import User from "../models/User";
import { uploadPostImages } from "../utils/uploads";

const upload = uploadPostImages.single('post-image')

export const pickPostMedia = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, function(err) {
        if (err) {
            return next({ statuscode: 400, message: err?.message || null })
        }
        res.status(200).json({
            success: true,
            path: req.file!.path,
            mimetype: req.file!.mimetype.slice(0, 5)
        })
    })
}

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    const { mediaPath, content, creator } = req.body;
    console.log(mediaPath, content, creator)
    if (!creator || (!mediaPath && !content)) {
        return next({})
    }

    try {
        let media = mediaPath ? mediaPath : null;
        const newPost = new Post({ creator, media, content })
        const post = await (await newPost.save()).populate({
            path: 'creator', select: '_id username name picture'
        })
        res.status(201).json({
            success: true,
            post
        })
    } catch (error) {
        next({})
    }
}

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    if (!postId) {
        return next({})
    }

    try {
        await Post.findByIdAndDelete(postId)
        res.sendStatus(204)
    } catch (error) {
        next({})
    }
}

export const getPublicPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    if (!userId) return next({ statuscode: 404 })
    try {
        let publicPosts = []
        const user = await User.findById(userId)
        const myPosts = await Post.find({ creator: userId }).populate('creator', '_id username picture name')
        if (myPosts?.length) {
            publicPosts.push(...myPosts)
        }
        for (let id of user.followings) {
            const userPosts = await Post.find({ creator: id }).populate('creator', '_id username picture name')
            if (userPosts?.length) {
                publicPosts.push(...userPosts)
            }
        }
        publicPosts = publicPosts.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1)

        res.status(200).json({
            success: true,
            posts: publicPosts
        })
    } catch (error) {
        next({})
    }

}

export const getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    if (!userId) return next({ statuscode: 404 })
    try {
        const posts = await Post.find({ creator: userId }).populate('creator', '_id username picture name')
        const userPosts = posts.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1)
        res.status(200).json({
            success: true, posts: userPosts
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
        
        console.log(post)

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