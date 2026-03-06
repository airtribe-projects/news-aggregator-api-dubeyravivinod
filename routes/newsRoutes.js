const express = require('express');
const router = express.Router();

// Import authentication middleware
const { authenticateToken } = require('../middleware/authMiddleware');

// Import news controller
const { 
    getNewsForUser, 
    markArticleAsRead,
    markArticleAsFavorite,
    removeFavorite,
    getReadArticles,
    getFavoriteArticles,
    searchArticles
} = require('../controllers/newsController');

// All routes require authentication
router.use(authenticateToken);

// GET /news - Fetch news articles based on user preferences
router.get('/news', async (req, res) => {
    try {
        const userId = req.user.userId; // Extract user ID from JWT token
        
        console.log(`Fetching news for user: ${userId}`);

        // Fetch news articles based on user preferences
        const newsData = await getNewsForUser(userId);

        res.status(200).json({
            message: 'News articles fetched successfully',
            total: newsData.totalResults,
            fromCache: newsData.fromCache,
            preferences: newsData.preferences,
            articles: newsData.articles
        });

    } catch (error) {
        console.error('Error fetching news:', error.message);

        // Handle specific error cases
        if (error.message.includes('NEWS_API_KEY is not configured')) {
            return res.status(500).json({
                message: 'Server configuration error',
                error: 'News API is not properly configured'
            });
        } else if (error.message.includes('Invalid News API key')) {
            return res.status(500).json({
                message: 'Server configuration error',
                error: 'Invalid News API credentials'
            });
        } else if (error.message.includes('rate limit exceeded')) {
            return res.status(429).json({
                message: 'Too many requests',
                error: 'News API rate limit exceeded. Please try again later.'
            });
        } else if (error.message.includes('No response from News API')) {
            return res.status(503).json({
                message: 'Service unavailable',
                error: 'Unable to connect to News API. Please try again later.'
            });
        } else {
            return res.status(500).json({
                message: 'Error fetching news articles',
                error: error.message
            });
        }
    }
});

// POST /news/:id/read - Mark article as read
router.post('/news/:id/read', async (req, res) => {
    try {
        const userId = req.user.userId;
        const articleId = req.params.id;
        const { title, url, image, description, source } = req.body;

        if (!title || !url) {
            return res.status(400).json({
                message: 'Article title and URL are required'
            });
        }

        const interaction = await markArticleAsRead(userId, articleId, {
            title,
            url,
            image,
            description,
            source
        });

        res.status(200).json({
            message: 'Article marked as read',
            interaction
        });
    } catch (error) {
        console.error('Error marking article as read:', error.message);
        res.status(500).json({
            message: 'Error marking article as read',
            error: error.message
        });
    }
});

// POST /news/:id/favorite - Mark article as favorite
router.post('/news/:id/favorite', async (req, res) => {
    try {
        const userId = req.user.userId;
        const articleId = req.params.id;
        const { title, url, image, description, source } = req.body;

        if (!title || !url) {
            return res.status(400).json({
                message: 'Article title and URL are required'
            });
        }

        const interaction = await markArticleAsFavorite(userId, articleId, {
            title,
            url,
            image,
            description,
            source
        });

        res.status(200).json({
            message: 'Article added to favorites',
            interaction
        });
    } catch (error) {
        console.error('Error marking article as favorite:', error.message);
        res.status(500).json({
            message: 'Error marking article as favorite',
            error: error.message
        });
    }
});

// DELETE /news/:id/favorite - Remove article from favorites
router.delete('/news/:id/favorite', async (req, res) => {
    try {
        const userId = req.user.userId;
        const articleId = req.params.id;

        const interaction = await removeFavorite(userId, articleId);

        res.status(200).json({
            message: 'Article removed from favorites',
            interaction
        });
    } catch (error) {
        console.error('Error removing favorite:', error.message);
        res.status(500).json({
            message: 'Error removing favorite',
            error: error.message
        });
    }
});

// GET /news/read - Retrieve all read articles
router.get('/news/read', async (req, res) => {
    try {
        const userId = req.user.userId;

        const articles = await getReadArticles(userId);

        res.status(200).json({
            message: 'Read articles retrieved successfully',
            total: articles.length,
            articles
        });
    } catch (error) {
        console.error('Error fetching read articles:', error.message);
        res.status(500).json({
            message: 'Error fetching read articles',
            error: error.message
        });
    }
});

// GET /news/favorites - Retrieve all favorite articles
router.get('/news/favorites', async (req, res) => {
    try {
        const userId = req.user.userId;

        const articles = await getFavoriteArticles(userId);

        res.status(200).json({
            message: 'Favorite articles retrieved successfully',
            total: articles.length,
            articles
        });
    } catch (error) {
        console.error('Error fetching favorite articles:', error.message);
        res.status(500).json({
            message: 'Error fetching favorite articles',
            error: error.message
        });
    }
});

// GET /news/search/:keyword - Search articles
router.get('/news/search/:keyword', async (req, res) => {
    try {
        const userId = req.user.userId;
        const keyword = req.params.keyword;

        if (!keyword || keyword.trim().length === 0) {
            return res.status(400).json({
                message: 'Search keyword is required'
            });
        }

        const results = await searchArticles(userId, keyword);

        res.status(200).json({
            message: 'Search completed successfully',
            keyword,
            ...results
        });
    } catch (error) {
        console.error('Error searching articles:', error.message);
        res.status(500).json({
            message: 'Error searching articles',
            error: error.message
        });
    }
});

module.exports = router;
