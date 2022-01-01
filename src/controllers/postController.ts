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
            path: req.file?.path
        })
    })
}

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    const { imagePath, content, creator } = req.body;
    if (!creator || (!imagePath && !content)) {
        return next({})
    }

    try {
        console.log('here')
        const newPost = new Post({ creator, media: imagePath, content })
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
    const { postId } = req.body;
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

