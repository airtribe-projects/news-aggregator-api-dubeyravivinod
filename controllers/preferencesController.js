const preferenceModel = require('../models/preferencesModel');

// Get user Preferences
exports.getUserPreferences = async (userId) => {
    const preferences = await preferenceModel.findOne({ userId });

    if (!preferences) {
        throw new Error('Preferences not found for user');    
    }

    return preferences;
};

// Update user Preferences
exports.updateUserPreferences = async (userId, preferenceData) => {
    console.log('Updating preferences for user:', userId, 'with data:', preferenceData);
    const preferences = await preferenceModel.findOneAndUpdate(
        { userId },
        {
            ...preferenceData,
            updatedAt: new Date()
        },
        { new: true, upsert: true }
    );
    return preferences;
};