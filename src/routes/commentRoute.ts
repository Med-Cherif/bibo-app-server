import { Router } from "express";
import * as controller from "../controllers/commentController"
import { isAuth } from "../middlewares/private";

const router = Router();

router.get('/posts/:postID/comments', isAuth, controller.getComments);
router.delete('/comments/:commentId', isAuth, controller.deleteComment);

export default router;