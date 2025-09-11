const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get hall statistics for admin dashboard
const getHallStats = async (req, res) => {
  try {
    const totalHalls = await prisma.hall.count();
    const pendingHalls = await prisma.hall.count({
      where: { status: 'pending' }
    });
    const approvedHalls = await prisma.hall.count({
      where: { status: 'approved' }
    });
    const rejectedHalls = await prisma.hall.count({
      where: { status: 'rejected' }
    });

    res.json({
      total: totalHalls,
      pending: pendingHalls,
      approved: approvedHalls,
      rejected: rejectedHalls
    });
  } catch (error) {
    console.error('Error fetching hall stats:', error);
    res.status(500).json({ error: 'Failed to fetch hall statistics' });
  }
};

// Get booking statistics for admin dashboard
const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({
      where: { status: 'pending' }
    });
    const approvedBookings = await prisma.booking.count({
      where: { status: 'approved' }
    });
    const cancelledBookings = await prisma.booking.count({
      where: { status: 'cancelled' }
    });

    res.json({
      total: totalBookings,
      pending: pendingBookings,
      approved: approvedBookings,
      cancelled: cancelledBookings
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ error: 'Failed to fetch booking statistics' });
  }
};

// Get user statistics for admin dashboard
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const customers = await prisma.user.count({
      where: { role: 'customer' }
    });
    const managers = await prisma.user.count({
      where: { role: 'manager' }
    });
    const admins = await prisma.user.count({
      where: { role: 'admin' }
    });

    res.json({
      total: totalUsers,
      customers: customers,
      managers: managers,
      admins: admins
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// Get halls for admin approval (with manager details)
const getHallsForApproval = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    console.log('Admin getting halls with status:', status);
    
    let whereClause = {};
    if (status !== 'all') {
      whereClause.status = status;
    }
    console.log('Where clause:', whereClause);

    const halls = await prisma.hall.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true
          }
        },
        address: {
          select: {
            city: true,
            state: true,
            country: true
          }
        },
        amenities: {
          select: {
            amenity: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        hallId: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedHalls = halls.map(hall => ({
      id: hall.hallId,
      name: hall.name,
      location: `${hall.address.city}, ${hall.address.state}`,
      capacity: hall.capacity,
      price: hall.price,
      status: hall.status,
      imageURLs: hall.imageURLs,
      description: hall.description,
      createdAt: new Date(), // Mock createdAt since we don't have it in schema
      manager: {
        id: hall.user.userId,
        name: hall.user.name,
        email: hall.user.email,
        phone: 'N/A' // Phone field doesn't exist in User model
      },
      amenities: hall.amenities.map(amenityHall => amenityHall.amenity.name)
    }));

    res.json({
      halls: transformedHalls,
      total: transformedHalls.length
    });
  } catch (error) {
    console.error('Error fetching halls for approval:', error);
    res.status(500).json({ error: 'Failed to fetch halls' });
  }
};

// Update hall status (approve/reject)
const updateHallStatus = async (req, res) => {
  try {
    const { hallId } = req.params;
    const { status } = req.body;
    const adminId = req.user.userId;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected.' });
    }

    // Check if hall exists
    const hall = await prisma.hall.findUnique({
      where: { hallId: hallId },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!hall) {
      return res.status(404).json({ error: 'Hall not found' });
    }

    // Update hall status
    const updatedHall = await prisma.hall.update({
      where: { hallId: hallId },
      data: {
        status: status
      }
    });

    // Log admin action (simple console log for now)
    console.log('Admin Action:', {
      adminId,
      action: `${status}_hall`,
      hallId,
      hallName: hall.name,
      managerName: hall.user.name,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: `Hall ${status} successfully`,
      hall: {
        id: updatedHall.hallId,
        name: updatedHall.name,
        status: updatedHall.status
      }
    });
  } catch (error) {
    console.error('Error updating hall status:', error);
    res.status(500).json({ error: 'Failed to update hall status' });
  }
};

// Get all users for admin management
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};
    if (role && role !== 'all') {
      whereClause.role = role;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            halls: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: parseInt(limit)
    });

    const totalUsers = await prisma.user.count({ where: whereClause });

    res.json({
      users: users,
      total: totalUsers,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalUsers / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get recent activity for admin dashboard
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        hall: { select: { name: true, location: true } }
      }
    });

    // Get recent hall submissions
    const recentHalls = await prisma.hall.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        type: 'booking',
        description: `${booking.user.name} booked ${booking.hall.name}`,
        status: booking.status,
        createdAt: booking.createdAt,
        user: booking.user,
        hall: booking.hall
      })),
      recentHalls: recentHalls.map(hall => ({
        id: hall.id,
        type: 'hall_submission',
        description: `${hall.user.name} submitted ${hall.name} for approval`,
        status: hall.status,
        createdAt: hall.createdAt,
        user: hall.user
      })),
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        type: 'user_registration',
        description: `New ${user.role} registered: ${user.name}`,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

module.exports = {
  getHallStats,
  getBookingStats,
  getUserStats,
  getHallsForApproval,
  updateHallStatus,
  getAllUsers,
  getRecentActivity
};
