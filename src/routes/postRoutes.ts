import express from "express";
import * as postFncs from "../controllers/postController";
import { isAuth } from "../middlewares/private";

const router = express.Router()

router.get('/public/:userId', isAuth, postFncs.getPublicPosts)
router.get('/:userId', isAuth, postFncs.getUserPosts)
router.get('/single/:postId', isAuth, postFncs.getPost)
router.post('/', isAuth, postFncs.createPost)
router.delete('/:postId', isAuth, postFncs.deletePost)
router.patch('/:postId', isAuth, postFncs.updatePost)

router.post('/reaction/like', isAuth, postFncs.likeAndUnlikePost)
router.post('/reaction/dislike', isAuth, postFncs.dislikeAndUndislikePost)

export default router