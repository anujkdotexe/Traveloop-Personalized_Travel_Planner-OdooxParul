const db = require('../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @description Handles user registration. Creates a new user account with hashed password.
 * Generates a unique avatar URL using the DiceBear API seeded with the user name.
 * @param {Object} req - Express request object
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain-text password (will be hashed)
 * @param {Object} res - Express response object
 * @returns {JSON} 201 on success with user data (id, name, email) or 500 on error
 */
exports.register = async (req, res) => {
  const { name, email, password, phone, city, country } = req.body;
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
      `INSERT INTO users (name, email, password_hash, role, profile_image_url, phone, city, country)
       VALUES ($1, $2, $3, 'user', $4, $5, $6, $7)
       RETURNING id, name, email, role, phone, city, country`,
      [
        name, 
        email, 
        hashedPassword, 
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name),
        phone || null,
        city || null,
        country || null
      ]
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

/**
 * @description Handles user login. Validates credentials against stored password hash.
 * Issues JWT token valid for 8 hours. Determines role by checking if email contains 'admin'.
 * @param {Object} req - Express request object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's plain-text password
 * @param {Object} res - Express response object
 * @returns {JSON} 200 with token and user data on success, 404/400 on auth failure, 500 on error
 */
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
  const { name, email, bio, language_preference, phone, city, country } = req.body;
  try {
    const result = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           bio = COALESCE($3, bio), 
           language_preference = COALESCE($4, language_preference),
           phone = COALESCE($5, phone),
           city = COALESCE($6, city),
           country = COALESCE($7, country)
       WHERE id = $8 
       RETURNING id, name, email, role, bio, language_preference, profile_image_url, phone, city, country`,
      [name, email, bio, language_preference, phone, city, country, req.user.id]
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

// Forgot Password
const crypto = require('crypto');
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      // Don't reveal if user exists for security
      return res.json({ status: 'success', message: 'If an account exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [token, expiry, email]
    );

    // Since we don't have SMTP, we log the link for testing/dev
    console.log(`PASS_RESET_LINK: http://localhost:5173/reset-password/${token}`);

    res.json({ status: 'success', message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Something went wrong.' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const result = await db.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid or expired token.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, result.rows[0].id]
    );

    res.json({ status: 'success', message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Reset failed.' });
  }
};

