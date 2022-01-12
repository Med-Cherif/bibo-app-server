import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsOptions } from "./utils/cors";
import { errorsResponse1, errorsResponse2 } from "./utils/errorResponse";
import auth from "./routes/authRoutes";
import post from "./routes/postRoutes";
import user from "./routes/userRoutes";
import chat from "./routes/chatRoutes";
import notifications from "./routes/notificationRoutes";

dotenv.config()
const app = express()

// middlewares
app.use(cors({
    origin: "*"
}))

app.use('/uploads', express.static('uploads'))
app.use(express.json())

// APIs
app.use('/api/auth', auth)
app.use('/api/posts', post)
app.use('/api/users', user)
app.use('/api/chats', chat)
app.use('/api/notifications', notifications)

app.use(errorsResponse1)
app.use(errorsResponse2)

export default app;