import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import env from './env';

// This will store a mapping of userId -> socketId to know who is online
export const onlineUsers = new Map<string, string>();

// This function will set up all our real-time event listeners
export function configureSocket(io: Server) {
  
  // --- Authentication Middleware ---
  // This runs for every new connecting client
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string; role: string };
      // Attach user info to the socket object for use in other events
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token.'));
    }
  });


  // --- Main Connection Handler ---
  // This runs after a client has successfully authenticated and connected
  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`✅ User connected: ${user.email} (Socket ID: ${socket.id})`);

    // Add user to our online list
    onlineUsers.set(user.id, socket.id);

    // Emit the list of online users to all clients
    io.emit('online_users', Array.from(onlineUsers.keys()));

    // --- Disconnect Handler ---
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${user.email}`);
      onlineUsers.delete(user.id);
      // Emit the updated list of online users
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });
}