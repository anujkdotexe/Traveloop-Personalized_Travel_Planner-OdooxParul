const db = require('../db/db');

// Get All Trips for Current User
exports.getUserTrips = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Create New Trip
exports.createTrip = async (req, res) => {
  const { title, start_date, end_date, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO trips (user_id, title, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, title, start_date, end_date, description]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Add Stop to Trip
exports.addStop = async (req, res) => {
  const { trip_id, city_name, country, arrival_date, departure_date, sequence_order } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO stops (trip_id, city_name, country, arrival_date, departure_date, sequence_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [trip_id, city_name, country, arrival_date, departure_date, sequence_order]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
