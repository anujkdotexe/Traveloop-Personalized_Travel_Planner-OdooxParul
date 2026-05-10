/**
 * @file adminController.js
 * @description Controller for admin-only endpoints providing platform analytics
 * such as total users, total trips, and top destinations. Endpoints should be
 * protected with admin-only middleware (`verifyAdmin`).
 * @author Traveloop Team
 */

const db = require('../db/db');

/**
 * @description Returns aggregated platform analytics used by the admin dashboard.
 * Uses SQL aggregates so the API only returns summary data, not raw user/trip rows.
 * Provides total user and trip counts and the top 5 destinations by stop count.
 * @param {Object} req - Express request object (requires admin auth middleware)
 * @param {Object} res - Express response object
 * @returns {JSON} 200 with analytics data or 500 on error
 */
exports.getAnalytics = async (req, res) => {
  try {
    const [users, trips, publicTrips, activities, topCities, categories, userGrowth] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM trips'),
      db.query('SELECT COUNT(*) FROM trips WHERE is_public = TRUE'),
      db.query('SELECT COUNT(*) FROM activities'),
      db.query(
        `SELECT city_name, country, COUNT(*) AS trip_count
         FROM stops
         GROUP BY city_name, country
         ORDER BY trip_count DESC
         LIMIT 5`
      ),
      db.query(
        `SELECT category, COUNT(*) as count 
         FROM activities 
         GROUP BY category 
         ORDER BY count DESC`
      ),
      db.query(
        `SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as count
         FROM users
         WHERE created_at > NOW() - INTERVAL '6 months'
         GROUP BY month, TO_CHAR(created_at, 'MM')
         ORDER BY TO_CHAR(created_at, 'MM')`
      ),
    ]);

    res.json({
      status: 'success',
      data: {
        total_users: parseInt(users.rows[0].count),
        total_trips: parseInt(trips.rows[0].count),
        public_trips: parseInt(publicTrips.rows[0].count),
        total_activities: parseInt(activities.rows[0].count),
        top_cities: topCities.rows,
        categories: categories.rows,
        user_growth: userGrowth.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch analytics.' });
  }
};

// ─── List all users ───────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
        (SELECT COUNT(*) FROM trips t WHERE t.user_id = u.id) AS trip_count
       FROM users u
       ORDER BY u.created_at DESC`
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch users.' });
  }
};

// ─── Delete a user ────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    // Prevent self-deletion
    if (userId === req.user.id)
      return res.status(400).json({ message: 'Admins cannot delete their own account via this endpoint.' });

    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ status: 'success', message: 'User removed.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete user.' });
  }
};
