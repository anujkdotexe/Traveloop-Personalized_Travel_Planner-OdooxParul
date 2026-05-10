/**
 * @file adminRoutes.js
 * @description Defines admin-only endpoints for platform analytics and insights.
 * All endpoints require both JWT authentication and admin role via verifyAdmin middleware.
 * Restricted to users with 'admin' in email address.
 * @author Traveloop Team
 */

const express = require('express');
const router = express.Router();
const ac = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/stats',              verifyAdmin, ac.getAnalytics);
router.get('/users',              verifyAdmin, ac.getUsers);
router.get('/users/:userId/trips', verifyAdmin, ac.getUserTrips);
router.patch('/users/:id/status',  verifyAdmin, ac.toggleUserStatus);
router.patch('/users/:id/role',    verifyAdmin, ac.updateUserRole);
router.delete('/users/:userId',   verifyAdmin, ac.deleteUser);
router.patch('/trips/:tripId',     verifyAdmin, ac.updateTripModeration);
router.delete('/trips/:tripId',    verifyAdmin, ac.deleteTripModeration);

module.exports = router;
