import express from "express"
import * as fncs from "../controllers/chatController"

const router = express.Router()

router.get('/:userId', fncs.getChats)
router.get('/:chatId/messages', fncs.getMessages)

export default router