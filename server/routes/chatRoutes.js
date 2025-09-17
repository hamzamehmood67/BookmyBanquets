const express = require('express');
const router = express.Router();
const { 
  getHallChats, 
  getManagerChats, 
  getChatMessages, 
  getCustomerChats, 
  createOrGetChat 
} = require('../controllers/chatController');
const { authenticateUser } = require('../middlewares/auth');

// Customer routes
router.post('/create', authenticateUser, createOrGetChat); // Create or get existing chat
router.get('/customer', authenticateUser, getCustomerChats); // Get all customer's chats

// Manager routes
router.get('/manager', authenticateUser, getManagerChats); // Get all manager's chats grouped by hall
router.get('/hall/:hallId', authenticateUser, getHallChats); // Get all chats for a specific hall

// Shared routes
router.get('/:chatId/messages', authenticateUser, getChatMessages); // Get messages for a specific chat

module.exports = router;
