const express = require('express');
const routes = express.Router();

// Import JWT authentication middleware
const { authenticateToken } = require('../middleware/authMiddleware');

// All routes below this line are protected.
routes.use(authenticateToken);

// Import Controllers
const { getUserPreferences, updateUserPreferences } = require('../controllers/preferencesController');

// Get User Preferences
routes.get('/preferences', async (req, res) => {
    console.log("Fetching preferences for user:", req);
    try {
        const userId = req.user.userId; // Extract user ID from authenticated token
        const preferences = await getUserPreferences(userId);
        res.status(200).json({ message: 'User preferences fetched successfully', preferences });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching preferences', error: error.message });
    }
});

// Update User Preferences
routes.put('/preferences', async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from authenticated token
        const { categories, languages, sources, notificationsEnabled } = req.body;

        const updateData = {};
        if (categories) updateData.categories = categories;
        if (languages) updateData.languages = languages;
        if (sources) updateData.sources = sources;
        if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;

        const preferences = await updateUserPreferences(userId, updateData);
        res.status(200).json({ message: 'User preferences updated successfully', preferences });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating preferences', error: error.message });
    }
});

module.exports = routes;