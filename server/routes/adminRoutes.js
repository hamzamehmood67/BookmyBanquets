const express = require('express');
const router = express.Router();
const {
  getHallStats,
  getBookingStats,
  getUserStats,
  getHallsForApproval,
  updateHallStatus,
  getAllUsers,
  getRecentActivity
} = require('../controllers/adminController');
const { authenticateUser } = require('../middlewares/auth');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

// Apply authentication and admin check to all routes
router.use(authenticateUser);
router.use(requireAdmin);

// Dashboard statistics routes
router.get('/halls/stats', getHallStats);
router.get('/bookings/stats', getBookingStats);
router.get('/users/stats', getUserStats);

// Hall management routes
router.get('/halls', getHallsForApproval);
router.put('/halls/:hallId/status', updateHallStatus);

// User management routes
router.get('/users', getAllUsers);

// Activity routes
router.get('/activity', getRecentActivity);

module.exports = router;
