import express from "express"
import * as fncs from "../controllers/chatController"

const router = express.Router()

router.get('/:userId', fncs.getChats)
router.get('/requests/:userId', fncs.getRequestedChats)
router.get('/:chatId/messages', fncs.getMessages)
router.patch('/:chatId', fncs.acceptChat)

export default router