const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 📦 1. Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      days,
      bookingDetails,
      price,
      guests,
      hallId
    } = req.body;

    const booking = await prisma.booking.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
        bookingDetails,
        price,
        guests,
        status: "pending",
        userId: req.user.userId,
        hallId
      }
    });

    res.status(201).json({ status: "success", data: booking });
  } catch (err) {
    res.status(500).json({ error: "Failed to create booking", details: err.message });
  }
};

// 📄 2. Get My Bookings (Customer)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.userId },
      include: { hall: true }
    });
    res.json({ status: "success", data: bookings });
  } catch (err) {
    res.status(500).json({ error: "Failed to get your bookings", details: err.message });
  }
};

// ❌ 3. Cancel Booking (Customer)
const cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingId: req.params.id }
    });

    if (!booking || booking.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized or booking not found" });
    }

    await prisma.booking.delete({ where: { bookingId: req.params.id } });
    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel booking", details: err.message });
  }
};

// 🏢 4. Get Bookings By Hall (Manager)
const getBookingsByHallId = async (req, res) => {
  try {
    const hall = await prisma.hall.findUnique({
      where: { hallId: req.params.hallId }
    });

    if (!hall || hall.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized or hall not found" });
    }

    const bookings = await prisma.booking.findMany({
      where: { hallId: req.params.hallId },
      include: { user: true }
    });

    res.json({ status: "success", data: bookings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings", details: err.message });
  }
};

// ✅ 5. Approve Booking (Manager)
const approveBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingId: req.params.id },
      include: { hall: true }
    });

    if (!booking || booking.hall.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized to approve this booking" });
    }

    const updated = await prisma.booking.update({
      where: { bookingId: req.params.id },
      data: { status: "approved" }
    });

    res.json({ message: "Booking approved", data: updated });
  } catch (err) {
    res.status(500).json({ error: "Approval failed", details: err.message });
  }
};

// ❌ 6. Reject Booking (Manager)
const rejectBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingId: req.params.id },
      include: { hall: true }
    });

    if (!booking || booking.hall.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized to reject this booking" });
    }

    const updated = await prisma.booking.update({
      where: { bookingId: req.params.id },
      data: { status: "rejected" }
    });

    res.json({ message: "Booking rejected", data: updated });
  } catch (err) {
    res.status(500).json({ error: "Rejection failed", details: err.message });
  }
};

// 🛡 7. View All Bookings (Admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { hall: true, user: true }
    });
    res.json({ status: "success", data: bookings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings", details: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getBookingsByHallId,
  approveBooking,
  rejectBooking,
  getAllBookings
};
