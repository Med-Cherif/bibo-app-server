import express from "express"
import * as fncs from "../controllers/chatController"
import { isAuth } from "../middlewares/private"

const router = express.Router()

router.get('/:userId', isAuth, fncs.getChats)
router.get('/:chatId/messages', isAuth, fncs.getMessages)

export default router