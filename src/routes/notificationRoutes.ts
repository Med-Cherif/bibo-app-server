import express from "express"
import * as fncs from "../controllers/notificationController"
import { isAuth } from "../middlewares/private"

const router = express.Router()

router.get('/:userId', isAuth, fncs.getNotifications)

export default router