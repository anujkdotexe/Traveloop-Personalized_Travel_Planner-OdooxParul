const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/analytics', verifyAdmin, adminController.getAnalytics);

module.exports = router;
