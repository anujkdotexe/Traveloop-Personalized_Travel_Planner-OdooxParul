const db = require('../db/db');

// Get Platform Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await db.query('SELECT COUNT(*) FROM users');
    const totalTrips = await db.query('SELECT COUNT(*) FROM trips');
    const topDestinations = await db.query(
      'SELECT city_name, COUNT(*) as count FROM stops GROUP BY city_name ORDER BY count DESC LIMIT 5'
    );

    res.json({
      status: 'success',
      data: {
        stats: {
          users: totalUsers.rows[0].count,
          trips: totalTrips.rows[0].count
        },
        destinations: topDestinations.rows
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
