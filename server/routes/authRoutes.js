/**
 * @file authRoutes.js
 * @description Defines public authentication endpoints for user registration and login.
 * No middleware required - endpoints are open to all users.
 * @author Traveloop Team
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyUser } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.patch('/profile', verifyUser, authController.updateProfile);
router.delete('/account', verifyUser, authController.deleteAccount);
router.get('/saved-destinations', verifyUser, authController.getSavedDestinations);
router.post('/saved-destinations', verifyUser, authController.addSavedDestination);
router.delete('/saved-destinations/:destinationId', verifyUser, authController.deleteSavedDestination);

module.exports = router;

