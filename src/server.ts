import https from 'https';
import http from "http";
import app from "./app";
import { connectDB } from './config/db';
import { Server } from "socket.io";
import { followUser, unfollowUser, getLikeNotification } from "./socket/userSocket"
import { handleMessage, startChat, onWriteMessage, onEndWriteMessage, seenMessage } from './socket/chatSocket';
import { makeComment } from './socket/commentSocket';

// const server = https.createServer({
//     key: "",
//     cert: ""
// }, app)

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
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
    socket.join(userId);

    followUser(socket, io)
    unfollowUser(socket, io)
    startChat(socket, io)
    handleMessage(socket, io)
    getLikeNotification(socket, io)
    onWriteMessage(socket, io)
    onEndWriteMessage(socket, io)
    seenMessage(socket, io)
    makeComment(socket, io)


    socket.on('offer', ({to, ...payload}) => {
        io.to(to).emit('offer', payload)
    })

    socket.on('answer', ({caller, sdp, myData, type}) => {
        io.to(caller).emit('answer', {sdp, myData, type})
    })

    socket.on('end call', (userID) => {
        io.to(userID).emit('end call')
    })

    socket.on('ice-candidate', ({userID, ...payload}) => {
        io.to(userID).emit('ice-candidate', payload)
    })
    
});

(
    async function() {
        try {
            await connectDB()
            server.listen(Number(PORT), function() {
                console.log('Server is listening')
            })
        } catch (error) {
            console.log(error)
            process.exit(1)
        }
    }
)()