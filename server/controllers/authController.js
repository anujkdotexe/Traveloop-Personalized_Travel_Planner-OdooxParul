const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  if (password.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });

  try {
    // Check if email already exists
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0)
      return res.status(409).json({ message: 'An account with that email already exists.' });

    const salt = await bcrypt.genSalt(12);          // cost factor 12 for security
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role, profile_image_url)
       VALUES ($1, $2, $3, 'user', $4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name)]
    );
    const newUser = result.rows[0];

    // 1. Welcome notification for user
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [newUser.id, 'Welcome to Traveloop!', 'Your journey starts here. Start planning your first trip today.', 'system']
    );

    // 2. Alert admins about new user
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       SELECT id, 'New User Registered', $1 || ' just joined the platform.', 'system'
       FROM users WHERE role = 'admin'`,
      [name]
    );

    res.status(201).json({ status: 'success', data: newUser });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Registration failed. Please try again.' });
  }
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });

  try {
    const result = await db.query(
      'SELECT id, name, email, role, password_hash, profile_image_url FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'No account found with that email address.' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profile_image_url,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Login failed. Please try again.' });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  const { name, email, bio, language_preference } = req.body;
  try {
    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           bio = COALESCE($3, bio), 
           language_preference = COALESCE($4, language_preference)
       WHERE id = $5 
       RETURNING id, name, email, role, bio, language_preference, profile_image_url`,
      [name, email, bio, language_preference, req.user.id]
    );
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update profile.' });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ status: 'success', message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to delete account.' });
  }
};

