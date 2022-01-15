import express from "express";
import * as fncs from "../controllers/userController";
import { isAllowed, isAuth } from "../middlewares/private"

const router = express.Router()

router.get('/', isAuth, fncs.getUsers)
router.get('/:userId', isAuth, fncs.getUser)
router.patch('/:userId', fncs.updateUser)
router.patch('/:userId/password', fncs.updateUserPassword)
router.patch('/:userId/picture', fncs.uploadProfilePicture)
router.delete('/:userId', isAuth, isAllowed, fncs.deleteUser)

export default router