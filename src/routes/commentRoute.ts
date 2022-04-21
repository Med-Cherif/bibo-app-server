import { Router } from "express";
import * as controller from "../controllers/commentController"

const router = Router();

router.get('/posts/:postID/comments', controller.getComments);
router.delete('/comments/:commentId', controller.deleteComment);

export default router;