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
    const [users, trips, publicTrips, activities, topCities, categories, userGrowth, prevUsers, prevTrips] = await Promise.all([
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
      db.query("SELECT COUNT(*) FROM users WHERE created_at < DATE_TRUNC('month', CURRENT_DATE)"),
      db.query("SELECT COUNT(*) FROM trips WHERE created_at < DATE_TRUNC('month', CURRENT_DATE)"),
    ]);

    const totalUsers = parseInt(users.rows[0].count);
    const lastMonthUsers = parseInt(prevUsers.rows[0].count);
    const userChange = lastMonthUsers === 0 ? 100 : Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100);

    const totalTrips = parseInt(trips.rows[0].count);
    const lastMonthTrips = parseInt(prevTrips.rows[0].count);
    const tripChange = lastMonthTrips === 0 ? 100 : Math.round(((totalTrips - lastMonthTrips) / lastMonthTrips) * 100);

    res.json({
      status: 'success',
      data: {
        total_users: totalUsers,
        user_change: userChange,
        total_trips: totalTrips,
        trip_change: tripChange,
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

// ─── Toggle user active status (Ban/Unban) ──────────────────────────────────
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE users SET is_active = NOT is_active WHERE id = $1', [id]);
    res.json({ status: 'success', message: 'User status updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Change user role ────────────────────────────────────────────────────────
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
  
  try {
    await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    res.json({ status: 'success', message: 'User role updated.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
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
// ─── Get a specific user's trips ─────────────────────────────────────────────
exports.getUserTrips = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query(
      `SELECT t.*, 
        (SELECT COUNT(*) FROM stops s WHERE s.trip_id = t.id) AS stop_count
       FROM trips t
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve user trips.' });
  }
};

exports.updateTripModeration = async (req, res) => {
  const { tripId } = req.params;
  const { is_public, status } = req.body;
  try {
    const result = await db.query(
      `UPDATE trips
       SET is_public = COALESCE($1, is_public),
           status = COALESCE($2, status)
       WHERE id = $3
       RETURNING *`,
      [typeof is_public === 'boolean' ? is_public : null, status || null, tripId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Trip not found.' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update trip moderation.' });
  }
};

exports.deleteTripModeration = async (req, res) => {
  const { tripId } = req.params;
  try {
    const result = await db.query('DELETE FROM trips WHERE id = $1 RETURNING id', [tripId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Trip not found.' });
    }
    res.json({ status: 'success', message: 'Trip removed.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete trip.' });
  }
};
