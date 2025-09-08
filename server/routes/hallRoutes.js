const express = require('express');
const { authenticateHallManager, verifyHallOwnership, authenticateUser } = require('../middlewares/auth.js');
const {
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
    getOwnedHalls,
    listPublicHalls
} = require('../controllers/hallController.js');

const router = express.Router();

// Core Routes
router.get('/', listPublicHalls);                           // Public - Get all halls
router.get('/:id', getSingleHall);                      // Public - Get single hall
router.post('/', authenticateHallManager, createHall);  // Hall Manager - Create hall
router.put('/:id', authenticateHallManager,verifyHallOwnership, updateHall); // Hall Manager - Update hall
router.delete('/:id', authenticateHallManager,verifyHallOwnership, deleteHall); // Hall Manager - Delete hall
router.get('/:id/amenities', getHallAmenities);         // Public - Get amenities of a hall
router.get('/:id/bookings', authenticateHallManager,verifyHallOwnership, getHallBookings); // Protected - Bookings for hall

// Advanced 
router.get('/search/query', searchHalls);               // Public - Search halls
router.get('/:id/availability', checkAvailability);     // Public - Check hall availability
router.get('/:id/reviews', getHallReviews);             // Public - Get all reviews for a hall
router.post('/:id/review', authenticateUser, postReview);                 // Protected (user) - Add review for hall
router.get('/top-rated/all', getTopRatedHalls);         // Public - Get top-rated halls
router.get('/owned/list', authenticateHallManager, getOwnedHalls); // Hall Manager - Own halls


module.exports = router;
