import express from "express";
import * as postFncs from "../controllers/postController";

const router = express.Router()

router.get('/public/:userId', postFncs.getPublicPosts)
router.get('/:userId', postFncs.getUserPosts)
router.post('/upload-image', postFncs.pickPostMedia)
router.post('/', postFncs.createPost)
router.delete('/:postId', postFncs.deletePost)

export default router