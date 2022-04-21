import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorsResponse1, errorsResponse2 } from "./utils/errorResponse";
import auth from "./routes/authRoutes";
import post from "./routes/postRoutes";
import user from "./routes/userRoutes";
import chat from "./routes/chatRoutes";
import comment from "./routes/commentRoute";
import notifications from "./routes/notificationRoutes";

dotenv.config()
const app = express()

// middlewares
app.use(cors())

app.use('/uploads', express.static('uploads'))
app.use(express.json())

// APIs
app.use('/api/auth', auth)
app.use('/api/posts', post)
app.use('/api', comment)
app.use('/api/users', user)
app.use('/api/chats', chat)
app.use('/api/notifications', notifications)

app.use(errorsResponse2)
app.use(errorsResponse1)

export default app;