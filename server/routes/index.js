const express = require("express");
const router = express.Router();
const userRouter = require('./userAuth');
const hallRouter = require('./hallRoutes');
const addressRouter = require('./addressRoutes');
const amenitiesRouter = require('./amenityRoutes');
const bookingRouter = require('./bookingRoutes');


router.get('/', (req, res) => {
    res.send("From Router")
})

//all routes will be prefixed with /api/v1
router.use('/user', userRouter);
router.use('/hall', hallRouter);
router.use('/address', addressRouter);
router.use('/amenity', amenitiesRouter);
router.use('/booking', bookingRouter);

module.exports = router;