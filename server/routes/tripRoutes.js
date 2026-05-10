const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyUser } = require('../middleware/auth');

router.get('/', verifyUser, tripController.getUserTrips);
router.post('/', verifyUser, tripController.createTrip);
router.post('/stop', verifyUser, tripController.addStop);

module.exports = router;
