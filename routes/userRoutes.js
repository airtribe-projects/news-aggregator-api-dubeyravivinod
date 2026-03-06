const express = require('express');
const routes = express.Router();
const bcrypt = require('bcrypt');

// Import Controllers
const { registerUser, loginUser, getUserPreferences, updateUserPreferences } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// User Registration Route
routes.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log('Received registration data:', req.body);

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.' });
        }

        req.body.password = await bcrypt.hash(password, 10);

        const dbuser = await registerUser(req.body);
        res.status(201).json({ message: 'User registered successfully', user: dbuser });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// User Login Route
routes.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const token = await loginUser(email, password);
        console.log('Login successful, generated token:', token);
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        if (error.message === 'JWT_SECRET is not configured') {
            return res.status(500).json({ message: 'Server configuration error', error: error.message });
        }
        res.status(401).json({ message: 'Invalid email or password', error: error.message });
    }
});

// All routes below this line are protected.
routes.use(authenticateToken);

// Protected Route Example
routes.get('/me', async (req, res) => {
    res.status(200).json({
        message: 'Authenticated user profile',
        user: req.user
    });
});

module.exports = routes;