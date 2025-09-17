import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from './AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Only connect if the user is authenticated (has a token)
    if (token) {
      // Create a new socket connection, passing the auth token
      const newSocket = io(API_URL, {
        auth: {
          token,
        },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      // Listen for the list of online users from the server
      newSocket.on('online_users', (users: string[]) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      // Cleanup on component unmount or when the token changes (logout)
      return () => {
        newSocket.off('online_users');
        newSocket.disconnect();
        console.log('Socket disconnected');
      };
    } else {
      // If there's no token, ensure any existing socket is disconnected
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};