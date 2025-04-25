// const { PrismaClient } = require('@prisma/client');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

 const createHall = async (req, res) => {
  try {
    const { name, description, capacity, price, imageURLs, status, addressId, amenities } = req.body;
    const hall = await prisma.hall.create({
      data: {
        name,
        description,
        capacity,
        price,
        imageURLs: imageURLs.join(','),
        status,
        userId: req.user.userId,
        addressId,
        amenities: {
          create: amenities.map(id => ({ amenityId: id }))
        }
      }
    });
    res.status(200).json({ hall, message: "Hall Profile created successfully" });
  } catch (err) {
    res.status(500).json({ error: 'Error creating hall', details: err.message });
  }
};

 const updateHall = async (req, res) => {
  try {
    const { imageURLs, amenities, ...rest } = req.body;

    // Format the imageURLs
    const formattedData = {
      ...rest,
      ...(imageURLs && { imageURLs: imageURLs.join(',') })
    };

    // TODO: Update amenities properly (optional step shown below)

    const updated = await prisma.hall.update({
      where: { hallId: req.params.id },
      data: formattedData
    });

    res.json({ status: 'success', data: updated, message: 'Hall updated successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Hall update failed', details: err.message });
  }
};

 const deleteHall = async (req, res) => {
  const hallId = req.params.id;

  try {
    // Step 1: Check if there are any active bookings
    const activeBooking = await prisma.booking.findFirst({
      where: {
        hallId,
        status: { in: ['pending', 'approved'] } // You can define what "active" means
      }
    });

    if (activeBooking) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot delete this hall. It has active bookings.'
      });
    }

    await prisma.amenitiesHall.deleteMany({ where: { hallId } });
    await prisma.review.deleteMany({ where: { hallId } });
    await prisma.booking.deleteMany({ where: { hallId } });
    await prisma.hall.delete({ where: { hallId } });

    res.json({
      status: 'success',
      message: 'Hall deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete hall',
      details: err.message
    });
  }
};

 const getAllHalls = async (req, res) => {
  console.log("Hello")
  try {
    const halls = await prisma.hall.findMany({
      include: {
        address: true,
        amenities: { include: { amenity: true } },
        reviews: true
      }
    });
    res.json(halls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch halls' });
  }
};

 const getSingleHall = async (req, res) => {
  try {
    const hall = await prisma.hall.findUnique({
      where: { hallId: req.params.id },
      include: {
        address: true,
        amenities: { include: { amenity: true } },
        reviews: true
      }
    });
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    res.json(hall);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hall' });
  }
};

 const getHallAmenities = async (req, res) => {
  try {
    const amenities = await prisma.amenitiesHall.findMany({
      where: { hallId: req.params.id },
      include: { amenity: true }
    });
    res.json(amenities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
};

 const getHallBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({ where: { hallId: req.params.id } });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

 const searchHalls = async (req, res) => {
  try {
    const { city, minPrice, maxPrice } = req.query;
    const halls = await prisma.hall.findMany({
      where: {
        price: {
          gte: Number(minPrice) || 0,
          lte: Number(maxPrice) || 100000
        },
        address: {
          city: { contains: city, mode: 'insensitive' }
        }
      },
      include: { address: true, amenities: true }
    });
    res.json(halls);
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
};

 const checkAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date inputs
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing startDate or endDate in query parameters'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        error: 'Invalid date format. Please provide valid ISO date strings.'
      });
    }

    // Find bookings that overlap with the requested range
    const overlapping = await prisma.booking.findMany({
      where: {
        hallId: req.params.id,
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start }
          }
        ]
      }
    });

    res.json({
      available: overlapping.length === 0,
      overlaps: overlapping.length,
      bookings: overlapping
    });
  } catch (err) {
    res.status(500).json({
      error: 'Availability check failed',
      details: err.message
    });
  }
};

 const getHallReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({ where: { hallId: req.params.id } });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get reviews' });
  }
};

 const postReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const hallId = req.params.id;
    const userId = req.user.userId;

    const hasBooking = await prisma.booking.findFirst({
      where: {
        userId,
        hallId,
        status: 'approved',
        endDate: {
          lt: new Date()
        }
      }
    });

    if (!hasBooking) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only review halls you have booked in the past.'
      });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        hallId,
        userId
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Review submitted successfully',
      data: review
    });

  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit review',
      details: err.message
    });
  }
};

 const getTopRatedHalls = async (req, res) => {
  try {
    const halls = await prisma.hall.findMany({
      include: {
        reviews: true
      }
    });
    const rated = halls.map(h => ({
      ...h,
      avgRating: h.reviews.reduce((sum, r) => sum + r.rating, 0) / (h.reviews.length || 1)
    })).sort((a, b) => b.avgRating - a.avgRating);

    res.json(rated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top halls' });
  }
};

 const getOwnedHalls = async (req, res) => {
  try {
    const halls = await prisma.hall.findMany({
      where: { userId: req.user.userId },
      include: { reviews: true, amenities: { include: { amenity: true } } }
    });
    res.json(halls);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your halls' });
  }
};

module.exports = {
  createHall,
  updateHall,
  deleteHall,
  getAllHalls,
  getSingleHall,
  getHallAmenities,
  getHallBookings,
  searchHalls,
  checkAvailability,
  getHallReviews,
  postReview,
  getTopRatedHalls,
  getOwnedHalls
};
