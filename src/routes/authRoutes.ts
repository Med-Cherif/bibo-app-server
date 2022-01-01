import express from "express";
import * as authFns from "../controllers/authController";

const router = express.Router()

router.post('/register', authFns.register)
router.post('/login', authFns.login)

export default router