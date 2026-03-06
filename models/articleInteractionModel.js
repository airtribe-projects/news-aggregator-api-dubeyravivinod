const mongoose = require('mongoose');

const articleInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    articleId: {
        type: String,
        required: true
    },
    articleTitle: {
        type: String,
        required: true
    },
    articleUrl: {
        type: String,
        required: true
    },
    articleImage: {
        type: String,
        default: null
    },
    articleDescription: {
        type: String,
        default: null
    },
    source: {
        type: String,
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    favoritedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create compound index for user and article
articleInteractionSchema.index({ userId: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('ArticleInteraction', articleInteractionSchema);
