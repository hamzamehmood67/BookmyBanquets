import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('SocketContext debug:', { user: !!user, token: !!token, hasUserData: !!user });
    if (user && token) {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
        auth: {
          token: token
        },
        autoConnect: true
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Connected to server:', newSocket.id);
        setIsConnected(true);
        setError(null);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        setError(error.message);
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        setError(error.message);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        console.log('Cleaning up socket connection');
        newSocket.close();
      };
    }
  }, [user]);

  // Socket helper functions
  const joinHallChat = (hallId) => {
    if (socket && isConnected) {
      console.log('Joining hall chat:', hallId);
      socket.emit('join_hall_chat', { hallId });
    }
  };

  const sendMessage = (hallId, message, toUserId = null) => {
    if (socket && isConnected) {
      console.log('Sending message:', { hallId, message, toUserId });
      socket.emit('send_message', { hallId, message, toUserId });
    }
  };

  const getManagerChats = () => {
    if (socket && isConnected) {
      console.log('Getting manager chats');
      socket.emit('get_manager_chats');
    }
  };

  const value = {
    socket,
    isConnected,
    error,
    joinHallChat,
    sendMessage,
    getManagerChats
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
