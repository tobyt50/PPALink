import { BadgeDollarSign, FilePlus, UserPlus, FileEdit, FileMinus } from 'lucide-react';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useActivityStore } from './ActivityStore';
import { useAuthStore } from './AuthContext';

// Use Vercel env for prod, fallback for local dev
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

// 1. Create the context with a default value to satisfy TypeScript
const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

// 2. The custom hook remains the same, but it's now more stable
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};


// 3. The Provider component contains all the logic
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const token = useAuthStore((state) => state.token);
  const addActivityEvent = useActivityStore((state) => state.addEvent);

  useEffect(() => {
    if (token) {
      // Establish the connection
      const newSocket = io(API_URL, {
        transports: ['websocket', 'polling'], // Keep polling as a fallback
        auth: { token },
      });

      setSocket(newSocket);
      
      // Define event handlers
      const handleNewSignup = (data: { type: string, email: string }) => {
        addActivityEvent({ message: `${data.type} signup: ${data.email}`, icon: UserPlus });
      };
      const handleJobPosted = (data: { title: string, agencyName: string }) => {
        addActivityEvent({ message: `${data.agencyName} posted: ${data.title}`, icon: FilePlus });
      };
      const handleJobUpdated = (data: { title: string, agencyName: string }) => {
        addActivityEvent({ message: `${data.agencyName} updated: ${data.title}`, icon: FileEdit });
      };
      const handleJobDeleted = (data: { title: string, agencyName: string }) => {
        addActivityEvent({ message: `${data.agencyName} deleted: ${data.title}`, icon: FileMinus });
      };
      const handleSubscription = (data: { userEmail: string, planName: string }) => {
        addActivityEvent({ message: `${data.userEmail} subscribed to the ${data.planName} plan`, icon: BadgeDollarSign });
      };
      const handleOnlineUsers = (users: string[]) => {
        setOnlineUsers(users);
      };

      // Attach event listeners
      newSocket.on('admin:new_signup', handleNewSignup);
      newSocket.on('admin:job_posted', handleJobPosted);
      newSocket.on('admin:job_updated', handleJobUpdated);
      newSocket.on('admin:job_deleted', handleJobDeleted);
      newSocket.on('admin:subscription_started', handleSubscription);
      newSocket.on('online_users', handleOnlineUsers);
      newSocket.on('connect', () => console.log('✅ Socket connected:', newSocket.id));

      // Return a cleanup function
      return () => {
        console.log('❌ Cleaning up socket connection...');
        newSocket.off('admin:new_signup', handleNewSignup);
        newSocket.off('admin:job_posted', handleJobPosted);
        newSocket.off('admin:subscription_started', handleSubscription);
        newSocket.off('online_users', handleOnlineUsers);
        newSocket.off('connect');
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [token, addActivityEvent]);

  // Use useMemo to prevent the context value from changing on every render, which optimizes performance
  const contextValue = useMemo(() => ({
    socket,
    onlineUsers,
  }), [socket, onlineUsers]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};