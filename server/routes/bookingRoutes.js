const express = require("express");
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getBookingsByHallId,
  approveBooking,
  rejectBooking,
  getAllBookings,
  checkAvailableTimeSlots
} = require("../controllers/bookingControllers.js");

const {
  authenticateUser,
  authenticateHallManager
} = require("../middlewares/auth.js");

const router = express.Router();

// Public routes
router.get("/availability", checkAvailableTimeSlots); // Check available time slots for a date

// Customer routes (authenticated)
router.post("/", authenticateUser, createBooking);
router.get("/my", authenticateUser, getMyBookings);
router.delete("/:id", authenticateUser, cancelBooking);

// Hall Manager routes (authenticated)
router.get("/hall/:hallId", authenticateHallManager, getBookingsByHallId);
router.patch("/:id/approve", authenticateHallManager, approveBooking);
router.patch("/:id/reject", authenticateHallManager, rejectBooking);

// Admin routes (would need authenticateAdmin middleware)
// router.get("/all", authenticateAdmin, getAllBookings);

module.exports = router;
