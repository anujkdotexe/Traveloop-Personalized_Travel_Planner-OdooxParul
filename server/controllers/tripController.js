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

    const stops = stopsResult.rows.map(stop => ({
      ...stop,
      activities: activitiesResult.rows.filter(a => a.stop_id === stop.id)
    }));

    res.json({
      status: 'success',
      data: {
        trip: tripResult.rows[0],
        stops: stops,
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
    const trip = result.rows[0];

    // Create Notification for User
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'Trip Created!', `Your journey to ${title} has been initialized.`, 'trip']
    );

    // Alert admins about new trip
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       SELECT id, 'New Trip Planned', $1 || ' just started planning a trip to ' || $2 || '.', 'system'
       FROM users WHERE role = 'admin'`,
      [req.user.name, title]
    );

    res.status(201).json({ status: 'success', data: trip });
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
    const trip = result.rows[0];

    // Create Notification if visibility changed
    if (is_public) {
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'Trip Shared!', `"${trip.title}" is now live in the community feed.`, 'community']
      );
    }

    res.json({ status: 'success', data: trip });
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
    // 1. Get categorized sum from expenses
    const expensesResult = await db.query(
      `SELECT category, SUM(amount) AS total
       FROM expenses
       WHERE trip_id = $1
       GROUP BY category
       ORDER BY total DESC`,
      [id]
    );
    
    // 2. Get raw expense items for the invoice
    const rawExpenses = await db.query(
      `SELECT * FROM expenses WHERE trip_id = $1 ORDER BY date DESC`,
      [id]
    );

    // 3. Get estimated costs from planned activities
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
        expenses: rawExpenses.rows,
        activity_cost: activitiesCostResult.rows[0].activity_total || 0,
        grand_total: grandTotal.rows[0].grand_total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to get budget.' });
  }
};

// ─── Add a new expense ───────────────────────────────────────────────────────
exports.addExpense = async (req, res) => {
  const { trip_id, category, amount, currency, date, description } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO expenses (trip_id, category, amount, currency, date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [trip_id, category, amount, currency || 'INR', date || new Date()]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to add expense.' });
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

exports.deleteChecklistItem = async (req, res) => {
  const { itemId } = req.params;
  try {
    await db.query('DELETE FROM checklists WHERE id = $1', [itemId]);
    res.json({ status: 'success', message: 'Checklist item deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete checklist item.' });
  }
};

exports.resetChecklist = async (req, res) => {
  const { tripId } = req.params;
  try {
    await db.query('UPDATE checklists SET is_packed = FALSE WHERE trip_id = $1', [tripId]);
    res.json({ status: 'success', message: 'Checklist reset.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to reset checklist.' });
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

exports.updateNote = async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ status: 'error', message: 'Note content is required.' });
  }

  try {
    const result = await db.query(
      'UPDATE notes SET content = $1 WHERE id = $2 RETURNING *',
      [content, noteId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Note not found.' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update note.' });
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

// ─── Top Destinations (Calculated from popular stops) ──────────────────────
exports.getTopDestinations = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT city_name as name, country, COUNT(*) as count 
      FROM stops 
      GROUP BY city_name, country 
      ORDER BY count DESC 
      LIMIT 4
    `);
    
    let destinations = result.rows.map(d => ({
      name: d.name + ', ' + d.country,
      img: `https://loremflickr.com/400/300/city,${encodeURIComponent(d.name)}`,
      desc: `${d.count} trips planned here`
    }));

    if (destinations.length === 0) {
      destinations = [
        { name: 'Tokyo, Japan', img: 'https://images.unsplash.com/photo-1540959733332-e94e270b4d8a?auto=format&fit=crop&w=400&q=80', desc: 'Modern tradition at its best.' },
        { name: 'Paris, France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80', desc: 'The city of lights and love.' },
        { name: 'Rome, Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80', desc: 'Explore the eternal city.' },
        { name: 'New York, USA', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80', desc: 'The city that never sleeps.' }
      ];
    }

    res.json({ status: 'success', data: destinations });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Copy a public trip to user's account ───────────────────────────────────
exports.copyTrip = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get original trip
    const original = await db.query('SELECT * FROM trips WHERE id = $1 AND is_public = TRUE', [id]);
    if (original.rows.length === 0) return res.status(404).json({ message: 'Public trip not found.' });
    
    const trip = original.rows[0];
    
    // 2. Create new trip for current user
    const newTrip = await db.query(
      `INSERT INTO trips (user_id, title, start_date, end_date, description, is_public, status)
       VALUES ($1, $2, $3, $4, $5, FALSE, 'Planned')
       RETURNING *`,
      [req.user.id, `Copy of ${trip.title}`, trip.start_date, trip.end_date, trip.description]
    );
    const newTripId = newTrip.rows[0].id;

    // 3. Copy stops
    const stops = await db.query('SELECT * FROM stops WHERE trip_id = $1', [id]);
    for (const stop of stops.rows) {
      const newStop = await db.query(
        `INSERT INTO stops (trip_id, city_name, country, arrival_date, departure_date, sequence_order)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [newTripId, stop.city_name, stop.country, stop.arrival_date, stop.departure_date, stop.sequence_order]
      );
      const newStopId = newStop.rows[0].id;

      // 4. Copy activities for each stop
      const activities = await db.query('SELECT * FROM activities WHERE stop_id = $1', [stop.id]);
      for (const act of activities.rows) {
        await db.query(
          `INSERT INTO activities (stop_id, activity_name, category, cost_estimate, scheduled_time)
           VALUES ($1, $2, $3, $4, $5)`,
          [newStopId, act.activity_name, act.category, act.cost_estimate, act.scheduled_time]
        );
      }
    }

    res.json({ status: 'success', data: newTrip.rows[0], message: 'Trip copied successfully!' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to copy trip.' });
  }
};

