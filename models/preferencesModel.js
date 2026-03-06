const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    categories: {
        type: [String],
        enum: ['technology', 'business', 'health', 'science', 'sports', 'entertainment', 'politics'],
        default: ['technology']
    },
    languages: {
        type: [String],
        enum: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
        default: ['en']
    },
    sources: {
        type: [String],
        default: []
    },
    notificationsEnabled: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Preferences', preferencesSchema);
