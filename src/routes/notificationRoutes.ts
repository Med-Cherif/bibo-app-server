import express from "express"
import * as fncs from "../controllers/notificationController"

const router = express.Router()

router.get('/:userId', fncs.getNotifications)

export default router