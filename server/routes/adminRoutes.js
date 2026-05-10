const express = require('express');
const router = express.Router();
const ac = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/stats',              verifyAdmin, ac.getAnalytics);
router.get('/users',              verifyAdmin, ac.getUsers);
router.delete('/users/:userId',   verifyAdmin, ac.deleteUser);

module.exports = router;
