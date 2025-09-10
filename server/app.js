const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const apiRouter = require('./routes/index');
const dotenv = require('dotenv');
// server/app.js
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');


dotenv.config();
const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});


app.get('/', async (req, res) => {
  res.send("Server Runing")
});


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', apiRouter);
// static hosting for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/upload', uploadRoutes);

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      select: { userId: true, name: true, email: true, role: true }
    });

    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    socket.userId = user.userId;
    socket.userRole = user.role;
    socket.userName = user.name;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userName} (${socket.userRole}) - Socket ID: ${socket.id}`);

  // Join user to their personal room for direct messaging
  socket.join(`user_${socket.userId}`);

  // Handle joining hall-specific chat rooms
  socket.on('join_hall_chat', async (data) => {
    try {
      const { hallId } = data;
      
      // Verify hall exists
      const hall = await prisma.hall.findUnique({
        where: { hallId },
        include: { user: true }
      });

      if (!hall) {
        socket.emit('error', { message: 'Hall not found' });
        return;
      }

      // Join hall-specific room
      socket.join(`hall_${hallId}`);
      console.log(`${socket.userName} joined hall chat: ${hall.name}`);

      // Send existing chat history
      const existingChat = await prisma.chat.findFirst({
        where: {
          hallId,
          OR: [
            { fromId: socket.userId, toId: hall.userId },
            { fromId: hall.userId, toId: socket.userId }
          ]
        },
        include: {
          messages: {
            include: {
              from: {
                select: { userId: true, name: true, role: true }
              }
            },
            orderBy: { sentAt: 'asc' }
          }
        }
      });

      if (existingChat) {
        socket.emit('chat_history', {
          chatId: existingChat.chatId,
          hallId,
          messages: existingChat.messages
        });
      }

    } catch (error) {
      console.error('Error joining hall chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  });

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { hallId, message, toUserId } = data;

      // Verify hall exists
      const hall = await prisma.hall.findUnique({
        where: { hallId },
        include: { user: true }
      });

      if (!hall) {
        socket.emit('error', { message: 'Hall not found' });
        return;
      }

      // Determine recipient based on user role
      let recipientId;
      if (socket.userRole === 'customer') {
        recipientId = hall.userId; // Send to hall manager
      } else if (socket.userRole === 'manager' && hall.userId === socket.userId) {
        recipientId = toUserId; // Manager replying to specific customer
      } else {
        socket.emit('error', { message: 'Unauthorized to send message in this chat' });
        return;
      }

      // Find or create chat
      let chat = await prisma.chat.findFirst({
        where: {
          hallId,
          OR: [
            { fromId: socket.userId, toId: recipientId },
            { fromId: recipientId, toId: socket.userId }
          ]
        }
      });

      if (!chat) {
        chat = await prisma.chat.create({
          data: {
            fromId: socket.userId,
            toId: recipientId,
            hallId
          }
        });
      }

      // Create message
      const newMessage = await prisma.message.create({
        data: {
          text: message,
          chatId: chat.chatId,
          fromId: socket.userId
        },
        include: {
          from: {
            select: { userId: true, name: true, role: true }
          }
        }
      });

      // Emit message to hall room (both users will receive it)
      io.to(`hall_${hallId}`).emit('new_message', {
        chatId: chat.chatId,
        hallId,
        message: newMessage
      });

      // Also emit to recipient's personal room if they're not in the hall room
      io.to(`user_${recipientId}`).emit('new_message', {
        chatId: chat.chatId,
        hallId,
        message: newMessage
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle getting manager's chats grouped by hall
  socket.on('get_manager_chats', async () => {
    try {
      if (socket.userRole !== 'manager') {
        socket.emit('error', { message: 'Unauthorized: Only managers can access this' });
        return;
      }

      // Get all halls owned by this manager
      const managerHalls = await prisma.hall.findMany({
        where: { userId: socket.userId },
        include: {
          chats: {
            include: {
              from: {
                select: { userId: true, name: true, role: true }
              },
              to: {
                select: { userId: true, name: true, role: true }
              },
              messages: {
                orderBy: { sentAt: 'desc' },
                take: 1,
                include: {
                  from: {
                    select: { userId: true, name: true, role: true }
                  }
                }
              }
            }
          }
        }
      });

      socket.emit('manager_chats', { halls: managerHalls });

    } catch (error) {
      console.error('Error getting manager chats:', error);
      socket.emit('error', { message: 'Failed to get chats' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userName} - Socket ID: ${socket.id}`);
  });
});

server.listen(process.env.PORT, () => {
  console.log('Server is running on http://localhost:3000');
});
