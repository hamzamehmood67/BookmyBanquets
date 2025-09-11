const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all chats for a specific hall (for managers)
const getHallChats = async (req, res) => {
  try {
    const { hallId } = req.params;
    const userId = req.user.userId;

    // Verify the hall belongs to the requesting manager
    const hall = await prisma.hall.findFirst({
      where: {
        hallId,
        userId // Only hall owner can access chats
      }
    });

    if (!hall) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to access chats for this hall'
      });
    }

    // Get all chats for this hall
    const chats = await prisma.chat.findMany({
      where: { hallId },
      include: {
        from: {
          select: { userId: true, name: true, role: true }
        },
        to: {
          select: { userId: true, name: true, role: true }
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1, // Get only the last message for preview
          include: {
            from: {
              select: { userId: true, name: true, role: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: {
        hallId,
        hallName: hall.name,
        chats
      }
    });

  } catch (error) {
    console.error('Get hall chats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get hall chats'
    });
  }
};

// Get all manager's halls with chat summaries
const getManagerChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (req.user.role !== 'manager') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only managers can access this endpoint'
      });
    }

    // Get all halls owned by this manager with their chats
    const halls = await prisma.hall.findMany({
      where: { userId },
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
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Transform data to group chats by hall
    const chatsByHall = halls.map(hall => ({
      hallId: hall.hallId,
      hallName: hall.name,
      chats: hall.chats.map(chat => ({
        chatId: chat.chatId,
        customerName: chat.from.role === 'customer' ? chat.from.name : chat.to.name,
        customerId: chat.from.role === 'customer' ? chat.from.userId : chat.to.userId,
        lastMessage: chat.messages[0] || null,
        createdAt: chat.createdAt
      }))
    }));

    res.json({
      status: 'success',
      data: { halls: chatsByHall }
    });

  } catch (error) {
    console.error('Get manager chats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get manager chats'
    });
  }
};

// Get chat messages between customer and manager for a specific hall
const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Find the chat and verify user has access
    const chat = await prisma.chat.findUnique({
      where: { chatId },
      include: {
        hall: {
          include: {
            user: {
              select: { userId: true, name: true, role: true }
            }
          }
        },
        from: {
          select: { userId: true, name: true, role: true }
        },
        to: {
          select: { userId: true, name: true, role: true }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({
        status: 'fail',
        message: 'Chat not found'
      });
    }

    // Verify user is part of this chat
    if (chat.fromId !== userId && chat.toId !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to access this chat'
      });
    }

    // Get all messages for this chat
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        from: {
          select: { userId: true, name: true, role: true }
        }
      },
      orderBy: { sentAt: 'asc' }
    });

    res.json({
      status: 'success',
      data: {
        chat: {
          chatId: chat.chatId,
          hallId: chat.hallId,
          hallName: chat.hall.name,
          participants: {
            customer: chat.from.role === 'customer' ? chat.from : chat.to,
            manager: chat.from.role === 'manager' ? chat.from : chat.to
          }
        },
        messages
      }
    });

  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get chat messages'
    });
  }
};

// Get customer's chats
const getCustomerChats = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (req.user.role !== 'customer') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only customers can access this endpoint'
      });
    }

    // Get all chats where user is participant
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { fromId: userId },
          { toId: userId }
        ]
      },
      include: {
        hall: {
          select: { hallId: true, name: true, imageURLs: true }
        },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data for customer view
    const customerChats = chats.map(chat => ({
      chatId: chat.chatId,
      hallId: chat.hall.hallId,
      hallName: chat.hall.name,
      hallImage: chat.hall.imageURLs ? chat.hall.imageURLs.split(',')[0] : null,
      managerName: chat.from.role === 'manager' ? chat.from.name : chat.to.name,
      lastMessage: chat.messages[0] || null,
      createdAt: chat.createdAt
    }));

    res.json({
      status: 'success',
      data: { chats: customerChats }
    });

  } catch (error) {
    console.error('Get customer chats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get customer chats'
    });
  }
};

// Create or get existing chat between customer and hall manager
const createOrGetChat = async (req, res) => {
  try {
    const { hallId } = req.body;
    const userId = req.user.userId;

    if (req.user.role !== 'customer') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only customers can initiate chats'
      });
    }

    // Get hall and its manager
    const hall = await prisma.hall.findUnique({
      where: { hallId },
      include: {
        user: {
          select: { userId: true, name: true, role: true }
        }
      }
    });

    if (!hall) {
      return res.status(404).json({
        status: 'fail',
        message: 'Hall not found'
      });
    }

    // Check if chat already exists
    let chat = await prisma.chat.findFirst({
      where: {
        hallId,
        OR: [
          { fromId: userId, toId: hall.userId },
          { fromId: hall.userId, toId: userId }
        ]
      },
      include: {
        hall: {
          select: { hallId: true, name: true }
        },
        from: {
          select: { userId: true, name: true, role: true }
        },
        to: {
          select: { userId: true, name: true, role: true }
        }
      }
    });

    // Create new chat if doesn't exist
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          fromId: userId,
          toId: hall.userId,
          hallId
        },
        include: {
          hall: {
            select: { hallId: true, name: true }
          },
          from: {
            select: { userId: true, name: true, role: true }
          },
          to: {
            select: { userId: true, name: true, role: true }
          }
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        chatId: chat.chatId,
        hallId: chat.hallId,
        hallName: chat.hall.name,
        participants: {
          customer: chat.from.role === 'customer' ? chat.from : chat.to,
          manager: chat.from.role === 'manager' ? chat.from : chat.to
        }
      }
    });

  } catch (error) {
    console.error('Create or get chat error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create or get chat'
    });
  }
};

module.exports = {
  getHallChats,
  getManagerChats,
  getChatMessages,
  getCustomerChats,
  createOrGetChat
};
