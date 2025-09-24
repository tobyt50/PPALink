import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import env from './env';

// This will store a mapping of userId -> socketId to know who is online
export const onlineUsers = new Map<string, string>();
// This will store the socket IDs of all connected admins
const onlineAdmins = new Set<string>();
// This will hold the global io instance after it's initialized
export let ioInstance: Server;


// This function will set up all our real-time event listeners
export function configureSocket(io: Server) {
  // Store the io instance so our services can access it
  ioInstance = io;
  
  // --- Authentication Middleware ---
  // This runs for every new connecting client
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string; role: Role };
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

    // --- THIS IS THE NEW LOGIC ---
    // If the connected user is an Admin, add their socket.id to our admin set
    if (user.role === Role.ADMIN) {
      onlineAdmins.add(socket.id);
    }
    // --- END OF NEW LOGIC ---

    // Emit the list of online users to all clients
    io.emit('online_users', Array.from(onlineUsers.keys()));

    // --- Disconnect Handler ---
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${user.email}`);
      onlineUsers.delete(user.id);

      // --- THIS IS THE NEW LOGIC ---
      // If the disconnected user was an Admin, remove them from the set
      if (user.role === Role.ADMIN) {
        onlineAdmins.delete(socket.id);
      }
      // --- END OF NEW LOGIC ---

      // Emit the updated list of online users
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });
}


// --- THIS IS THE NEW HELPER FUNCTION ---
/**
 * A helper function to securely broadcast an event to all currently connected admins.
 * This can be imported and used by any service file.
 * @param event The name of the socket event (e.g., 'admin:new_signup').
 * @param payload The data to send with the event.
 */
export function emitToAdmins(event: string, payload: any) {
  if (onlineAdmins.size > 0 && ioInstance) {
      ioInstance.to(Array.from(onlineAdmins)).emit(event, payload);
  }
}