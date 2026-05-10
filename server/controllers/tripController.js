const db = require('../db/db');

// ─── Get all trips for the authenticated user ───────────────────────────────
exports.getUserTrips = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, 
        (SELECT COUNT(*) FROM stops s WHERE s.trip_id = t.id) AS stop_count
       FROM trips t
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve trips.' });
  }
};

// ─── Get a single trip with all stops and activities ────────────────────────
exports.getTripById = async (req, res) => {
  const { id } = req.params;
  try {
    const tripResult = await db.query(
      'SELECT * FROM trips WHERE id = $1 AND (user_id = $2 OR is_public = TRUE)',
      [id, req.user?.id]
    );
    if (tripResult.rows.length === 0)
      return res.status(404).json({ message: 'Trip not found.' });

    const stopsResult = await db.query(
      'SELECT * FROM stops WHERE trip_id = $1 ORDER BY sequence_order',
      [id]
    );

    const activitiesResult = await db.query(
      `SELECT a.* FROM activities a
       JOIN stops s ON a.stop_id = s.id
       WHERE s.trip_id = $1
       ORDER BY a.scheduled_time`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        trip: tripResult.rows[0],
        stops: stopsResult.rows,
        activities: activitiesResult.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to retrieve trip.' });
  }
};

// ─── Create a new trip ───────────────────────────────────────────────────────
exports.createTrip = async (req, res) => {
  const { title, start_date, end_date, description, is_public } = req.body;
  if (!title || !start_date || !end_date)
    return res.status(400).json({ message: 'Trip name, start date, and end date are required.' });
  if (end_date < start_date)
    return res.status(400).json({ message: 'End date must be after start date.' });

  try {
    const result = await db.query(
      `INSERT INTO trips (user_id, title, start_date, end_date, description, is_public, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Planned')
       RETURNING *`,
      [req.user.id, title, start_date, end_date, description || null, is_public || false]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to create trip.' });
  }
};

// ─── Update a trip ───────────────────────────────────────────────────────────
exports.updateTrip = async (req, res) => {
  const { id } = req.params;
  const { title, start_date, end_date, description, status, is_public } = req.body;
  try {
    const result = await db.query(
      `UPDATE trips
       SET title = COALESCE($1, title),
           start_date = COALESCE($2, start_date),
           end_date = COALESCE($3, end_date),
           description = COALESCE($4, description),
           status = COALESCE($5, status),
           is_public = COALESCE($6, is_public)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title, start_date, end_date, description, status, is_public, id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Trip not found or unauthorized.' });
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update trip.' });
  }
};

// ─── Delete a trip ───────────────────────────────────────────────────────────
exports.deleteTrip = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Trip not found or unauthorized.' });
    res.json({ status: 'success', message: 'Trip deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete trip.' });
  }
};

// ─── Add a stop to a trip ────────────────────────────────────────────────────
exports.addStop = async (req, res) => {
  const { trip_id, city_name, country, arrival_date, departure_date, sequence_order } = req.body;
  if (!trip_id || !city_name || !country || !arrival_date || !departure_date)
    return res.status(400).json({ message: 'All stop fields are required.' });

  try {
    const result = await db.query(
      `INSERT INTO stops (trip_id, city_name, country, arrival_date, departure_date, sequence_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [trip_id, city_name, country, arrival_date, departure_date, sequence_order || 1]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to add stop.' });
  }
};

// ─── Add an activity to a stop ───────────────────────────────────────────────
exports.addActivity = async (req, res) => {
  const { stop_id, activity_name, cost_estimate, duration_minutes, category, scheduled_time } = req.body;
  if (!stop_id || !activity_name)
    return res.status(400).json({ message: 'Stop ID and activity name are required.' });

  try {
    const result = await db.query(
      `INSERT INTO activities (stop_id, activity_name, cost_estimate, duration_minutes, category, scheduled_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [stop_id, activity_name, cost_estimate || 0, duration_minutes || null, category || null, scheduled_time || null]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to add activity.' });
  }
};

// ─── Get budget breakdown for a trip ────────────────────────────────────────
exports.getTripBudget = async (req, res) => {
  const { id } = req.params;
  try {
    const expensesResult = await db.query(
      `SELECT category, SUM(amount) AS total
       FROM expenses
       WHERE trip_id = $1
       GROUP BY category
       ORDER BY total DESC`,
      [id]
    );
    const activitiesCostResult = await db.query(
      `SELECT SUM(a.cost_estimate) AS activity_total
       FROM activities a
       JOIN stops s ON a.stop_id = s.id
       WHERE s.trip_id = $1`,
      [id]
    );
    const grandTotal = await db.query(
      `SELECT SUM(amount) AS grand_total FROM expenses WHERE trip_id = $1`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        breakdown: expensesResult.rows,
        activity_cost: activitiesCostResult.rows[0].activity_total || 0,
        grand_total: grandTotal.rows[0].grand_total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to get budget.' });
  }
};

// ─── Get/Update checklist for a trip ────────────────────────────────────────
exports.getChecklist = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM checklists WHERE trip_id = $1 ORDER BY category, created_at',
      [id]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to get checklist.' });
  }
};

exports.addChecklistItem = async (req, res) => {
  const { trip_id, item_name, category } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO checklists (trip_id, item_name, category) VALUES ($1, $2, $3) RETURNING *',
      [trip_id, item_name, category || 'General']
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to add checklist item.' });
  }
};

exports.toggleChecklistItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    const result = await db.query(
      'UPDATE checklists SET is_packed = NOT is_packed WHERE id = $1 RETURNING *',
      [itemId]
    );
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to toggle item.' });
  }
};

// ─── Get/Add/Delete notes for a trip ────────────────────────────────────────
exports.getNotes = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM notes WHERE trip_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to get notes.' });
  }
};

exports.addNote = async (req, res) => {
  const { trip_id, content } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO notes (trip_id, content) VALUES ($1, $2) RETURNING *',
      [trip_id, content]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to add note.' });
  }
};

exports.deleteNote = async (req, res) => {
  const { noteId } = req.params;
  try {
    await db.query('DELETE FROM notes WHERE id = $1', [noteId]);
    res.json({ status: 'success', message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete note.' });
  }
};

// ─── Get public trips (Community feed) ──────────────────────────────────────
exports.getPublicTrips = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, u.name AS author_name,
        (SELECT COUNT(*) FROM stops s WHERE s.trip_id = t.id) AS stop_count
       FROM trips t
       JOIN users u ON u.id = t.user_id
       WHERE t.is_public = TRUE
       ORDER BY t.created_at DESC
       LIMIT 20`
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to get community trips.' });
  }
};
