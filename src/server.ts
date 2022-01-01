import http from 'http';
import app from "./app";
import { connectDB } from './config/db';
import { Server } from "socket.io";
import { followUser, unfollowUser } from "./socket/userSocket"
import { handleMessage, startChat } from './socket/chatSocket';

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000"
    }
})

const PORT = process.env.PORT || 5000;

io.use((socket, next) => {
    const { userId } = socket.handshake.auth
    if (userId) {
        (socket as any).userId = userId
    }
    next()
});

io.on('connection', (socket) => {
    const { userId } = socket as any;
    socket.join(userId)

    socket.on('test1', msg => console.log(msg))

    followUser(socket, io)
    unfollowUser(socket, io)
    startChat(socket, io)
    handleMessage(socket, io)
    
});

(
    async function() {
        try {
            await connectDB()
            server.listen(PORT, () => console.log('server is listening'))
        } catch (error) {
            console.log(error)
            process.exit(1)
        }
    }
)()