const db = require('../db/db');

// ─── Platform analytics ──────────────────────────────────────────────────────
exports.getAnalytics = async (req, res) => {
  try {
    const [users, trips, publicTrips, activities, topCities] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM trips'),
      db.query('SELECT COUNT(*) FROM trips WHERE is_public = TRUE'),
      db.query('SELECT COUNT(*) FROM activities'),
      db.query(
        `SELECT city_name, country, COUNT(*) AS trip_count
         FROM stops
         GROUP BY city_name, country
         ORDER BY trip_count DESC
         LIMIT 10`
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
