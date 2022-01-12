import express from "express";
import * as postFncs from "../controllers/postController";

const router = express.Router()

router.get('/public/:userId', postFncs.getPublicPosts)
router.get('/:userId', postFncs.getUserPosts)
router.get('/single/:postId', postFncs.getPost)
router.post('/upload-image', postFncs.pickPostMedia)
router.post('/', postFncs.createPost)
router.delete('/:postId', postFncs.deletePost)
router.patch('/:postId', postFncs.updatePost)

router.post('/reaction/like', postFncs.likeAndUnlikePost)
router.post('/reaction/dislike', postFncs.dislikeAndUndislikePost)

export default router