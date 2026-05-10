const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyUser } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.patch('/profile', verifyUser, authController.updateProfile);
router.delete('/account', verifyUser, authController.deleteAccount);

module.exports = router;

