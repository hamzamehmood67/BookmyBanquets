const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 📦 1. Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      days,
      timeSlot,
      timeSlotLabel,
      duration,
      bookingDetails,
      price,
      guests,
      hallId
    } = req.body;

    // Debug logging
    console.log("Creating booking with user:", req.user);
    console.log("User ID:", req.user?.userId);
    console.log("Request body:", req.body);

    // Validate required fields
    if (!startDate || !timeSlot || !timeSlotLabel || !duration || !price || !guests || !hallId) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: ["startDate", "timeSlot", "timeSlotLabel", "duration", "price", "guests", "hallId"]
      });
    }

    // Validate user authentication
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        error: "User authentication required", 
        details: "req.user.userId is missing" 
      });
    }

    // Validate time slot
    const validTimeSlots = ['morning', 'afternoon', 'evening'];
    if (!validTimeSlots.includes(timeSlot)) {
      return res.status(400).json({ 
        error: "Invalid time slot", 
        validSlots: validTimeSlots 
      });
    }

    // Check for conflicting bookings (same hall, same date, same time slot)
    const targetDate = new Date(startDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        hallId,
        startDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        timeSlot,
        status: {
          in: ['pending', 'approved']
        }
      }
    });

    if (conflictingBooking) {
      return res.status(409).json({ 
        error: "Time slot not available", 
        message: `The ${timeSlot} slot is already booked for this date` 
      });
    }

    const booking = await prisma.booking.create({
      data: {
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        days: days || 1,
        timeSlot,
        timeSlotLabel,
        duration: parseInt(duration),
        bookingDetails: typeof bookingDetails === 'string' ? bookingDetails : JSON.stringify(bookingDetails),
        price: parseFloat(price),
        guests: parseInt(guests),
        status: "pending",
        userId: req.user.userId,
        hallId
      }
    });

    res.status(201).json({ status: "success", data: booking, message: "Booking request submitted successfully" });
  } catch (err) {
    console.error("Create booking error:", err);
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
      where: { bookingId: req.params.id },
      include: { hall: true }
    });

    if (!booking) {
      return res.status(404).json({ 
        error: "Booking not found" 
      });
    }

    if (booking.userId !== req.user.userId) {
      return res.status(403).json({ 
        error: "Unauthorized - You can only cancel your own bookings" 
      });
    }

    // Check if booking is already cancelled
    if (booking.status === "cancelled") {
      return res.status(400).json({ 
        error: "Booking is already cancelled" 
      });
    }

    // Check if booking is already completed (past event)
    if (new Date(booking.startDate) < new Date()) {
      return res.status(400).json({ 
        error: "Cannot cancel a completed booking" 
      });
    }

    // Business Logic: Check 24-hour cancellation policy (only for approved bookings)
    if (booking.status === "approved") {
      const now = new Date();
      const eventDate = new Date(booking.startDate);
      const timeDifference = eventDate.getTime() - now.getTime();
      const hoursUntilEvent = timeDifference / (1000 * 60 * 60); // Convert to hours

      console.log("Cancellation check for approved booking:", {
        bookingId: booking.bookingId,
        status: booking.status,
        eventDate: eventDate.toISOString(),
        currentTime: now.toISOString(),
        hoursUntilEvent: hoursUntilEvent.toFixed(2)
      });

      if (hoursUntilEvent < 24) {
        return res.status(400).json({ 
          error: "Cancellation not allowed within 24 hours",
          message: "Approved bookings cannot be cancelled less than 24 hours before the event",
          hoursUntilEvent: Math.round(hoursUntilEvent * 100) / 100
        });
      }
    } else {
      console.log("Cancellation allowed - booking is not approved:", {
        bookingId: booking.bookingId,
        status: booking.status,
        message: "Pending bookings can be cancelled anytime"
      });
    }

    // Update booking status to "cancelled" instead of deleting
    const updatedBooking = await prisma.booking.update({
      where: { bookingId: req.params.id },
      data: { 
        status: "cancelled",
        // You might want to add a cancelledAt timestamp field in the future
      },
      include: { hall: true }
    });

    res.json({ 
      status: "success",
      message: "Booking cancelled successfully",
      data: {
        bookingId: updatedBooking.bookingId,
        status: updatedBooking.status,
        hallName: updatedBooking.hall?.name,
        eventDate: updatedBooking.startDate,
        cancelledAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ 
      error: "Failed to cancel booking", 
      details: err.message 
    });
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

// 🗓 8. Check Available Time Slots for a Date
const checkAvailableTimeSlots = async (req, res) => {
  try {
    const { hallId, date } = req.query;

    if (!hallId || !date) {
      return res.status(400).json({ 
        error: "Missing required parameters", 
        required: ["hallId", "date"] 
      });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Create date range for the entire day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log("Checking availability for:", {
      hallId,
      date,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    // Get all bookings for this hall on this date (using date range)
    const bookings = await prisma.booking.findMany({
      where: {
        hallId,
        startDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['pending', 'approved']
        }
      },
      select: {
        timeSlot: true,
        timeSlotLabel: true,
        startDate: true,
        bookingId: true
      }
    });

    console.log("Found bookings:", bookings);

    // Define all available time slots
    const allTimeSlots = [
      { id: 'morning', label: 'Morning (10:00 AM - 2:00 PM)', available: true },
      { id: 'afternoon', label: 'Afternoon (3:00 PM - 7:00 PM)', available: true },
      { id: 'evening', label: 'Evening (7:30 PM - 11:30 PM)', available: true }
    ];

    // Mark booked slots as unavailable
    const bookedSlots = bookings.map(b => b.timeSlot);
    console.log("Booked slots:", bookedSlots);
    
    const availableTimeSlots = allTimeSlots.map(slot => ({
      ...slot,
      available: !bookedSlots.includes(slot.id)
    }));

    res.json({ 
      status: "success", 
      date: targetDate.toISOString().split('T')[0],
      availableTimeSlots,
      bookedSlots,
      bookingsFound: bookings.length
    });
  } catch (err) {
    console.error("Check availability error:", err);
    res.status(500).json({ error: "Failed to check availability", details: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getBookingsByHallId,
  approveBooking,
  rejectBooking,
  getAllBookings,
  checkAvailableTimeSlots
};
