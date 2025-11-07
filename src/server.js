import { Server } from "socket.io";

const PORT = 8000

const io = new Server(PORT, { cors: { origin: '*' } });
io.on("connection", (socket) => socket.onAny((event, data) => socket.broadcast.emit(event, data)))
console.log(`Server is listening on ws://localhost:${PORT}`)