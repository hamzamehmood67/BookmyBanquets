import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Clock, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ChatModal = ({ isOpen, onClose, hallData }) => {
  const { user } = useAuth();
  const { socket, isConnected, joinHallChat, sendMessage } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join hall chat when modal opens
  useEffect(() => {
    if (isOpen && hallData?.hallId && socket && isConnected) {
      console.log('Joining hall chat for:', hallData.hallId);
      joinHallChat(hallData.hallId);
      setIsLoading(true);
    }
  }, [isOpen, hallData?.hallId, socket, isConnected, joinHallChat]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleChatHistory = (data) => {
      console.log('Received chat history:', data);
      setChatId(data.chatId);
      setMessages(data.messages.map(msg => ({
        id: msg.messageId,
        text: msg.text,
        sender: msg.from.role,
        timestamp: new Date(msg.sentAt),
        status: 'read',
        senderName: msg.from.name
      })));
      setIsLoading(false);
    };

    const handleNewMessage = (data) => {
      console.log('Received new message:', data);
      setChatId(data.chatId);
      const newMsg = {
        id: data.message.messageId,
        text: data.message.text,
        sender: data.message.from.role,
        timestamp: new Date(data.message.sentAt),
        status: 'delivered',
        senderName: data.message.from.name
      };
      setMessages(prev => [...prev, newMsg]);
    };

    const handleError = (error) => {
      console.error('Socket error:', error);
      setIsLoading(false);
    };

    socket.on('chat_history', handleChatHistory);
    socket.on('new_message', handleNewMessage);
    socket.on('error', handleError);

    return () => {
      socket.off('chat_history', handleChatHistory);
      socket.off('new_message', handleNewMessage);
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !isConnected || !hallData?.hallId) {
      console.log("Cannot send message - missing requirements:", {
        hasMessage: !!newMessage.trim(),
        hasSocket: !!socket,
        isConnected: isConnected,
        hasHallId: !!hallData?.hallId
      });
      return;
    }

    console.log("Sending message to hall:", hallData.hallId);
    // Send message via WebSocket
    sendMessage(hallData.hallId, newMessage.trim());
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg mx-4 h-[600px] flex flex-col"
        >
          {/* Chat Header */}
          <div className="px-6 py-4 bg-[#FF477E] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {user?.role === 'customer' ? 'Hall Manager' : 'Customer Chat'}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {hallData?.name || 'Hall Discussion'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9D2235] mx-auto mb-4"></div>
                  <p className="text-gray-500 text-sm">Loading chat history...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No messages yet</p>
                  <p className="text-gray-400 text-xs">Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
              const isNewDay = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
              
              return (
                <div key={message.id}>
                  {/* Date separator */}
                  {isNewDay && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  {/* Message */}
                  <div className={`flex ${
                    message.sender === user?.role ? 'justify-end' : 'justify-start'
                  }`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === user?.role
                        ? 'bg-[#FF477E] text-white rounded-br-md'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <div className={`flex items-center justify-end mt-1 space-x-1 ${
                        message.sender === user?.role ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {message.sender === user?.role && (
                          <div className="text-xs">
                            {message.status === 'sent' && <Clock className="w-3 h-3" />}
                            {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                            {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#9D2235] focus:border-transparent resize-none max-h-20"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-[#9D2235] text-white rounded-full hover:bg-[#8a1e2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChatModal;
