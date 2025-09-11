const express = require("express");
const router = express.Router();
const userRouter = require('./userAuth');
const hallRouter = require('./hallRoutes');
const addressRouter = require('./addressRoutes');
const amenitiesRouter = require('./amenityRoutes');
const bookingRouter = require('./bookingRoutes');
const chatRouter = require('./chatRoutes');
const adminRouter = require('./adminRoutes');


router.get('/', (req, res) => {
    res.send("From Router")
})

//all routes will be prefixed with /api/v1
router.use('/user', userRouter);
router.use('/hall', hallRouter);
router.use('/address', addressRouter);
router.use('/amenity', amenitiesRouter);
router.use('/booking', bookingRouter);
router.use('/chat', chatRouter);
router.use('/admin', adminRouter);

module.exports = router;