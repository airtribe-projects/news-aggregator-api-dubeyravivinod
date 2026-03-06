const axios = require('axios');
const { getUserPreferences } = require('./preferencesController');
const cacheService = require('../services/cacheService');
const ArticleInteraction = require('../models/articleInteractionModel');

// Fetch news articles based on user preferences (with caching)
exports.getNewsForUser = async (userId) => {
    try {
        // Validate NEWS_API_KEY is configured
        if (!process.env.NEWS_API_KEY) {
            throw new Error('NEWS_API_KEY is not configured in environment variables');
        }

        // Get user preferences
        let preferences;
        try {
            preferences = await getUserPreferences(userId);
        } catch (error) {
            // If no preferences found, use defaults
            preferences = {
                categories: ['technology'],
                languages: ['en']
            };
        }

        // Build cache key
        const category = preferences.categories && preferences.categories.length > 0 
            ? preferences.categories[0] 
            : 'technology';
        
        const language = preferences.languages && preferences.languages.length > 0 
            ? preferences.languages[0] 
            : 'en';

        const cacheKey = `news_${category}_${language}`;

        // Check cache first
        let cachedNews = await cacheService.get(cacheKey);
        if (cachedNews) {
            console.log('Returning cached news for user:', userId);
            return {
                ...cachedNews,
                fromCache: true
            };
        }

        // Fetch from API if not in cache
        console.log('Cache miss. Fetching from News API...');
        
        // Prepare NewsAPI request
        const newsApiUrl = 'https://newsapi.org/v2/top-headlines';
        const params = {
            apiKey: process.env.NEWS_API_KEY,
            category: category,
            language: language,
            pageSize: 20
        };

        // Add sources if specified in preferences
        if (preferences.sources && preferences.sources.length > 0) {
            params.sources = preferences.sources.join(',');
            delete params.category; // Cannot use category and sources together
        }

        // Make API request using axios with async/await
        const response = await axios.get(newsApiUrl, { 
            params,
            timeout: 10000 // 10 second timeout
        });

        // Validate response
        if (response.data.status !== 'ok') {
            throw new Error(`News API returned status: ${response.data.status}`);
        }

        const newsData = {
            totalResults: response.data.totalResults,
            articles: response.data.articles,
            preferences: {
                category,
                language,
                sources: preferences.sources || []
            }
        };

        // Cache the results
        await cacheService.set(cacheKey, newsData);

        return {
            ...newsData,
            fromCache: false
        };

    } catch (error) {
        // Handle different types of errors
        if (error.response) {
            // NewsAPI returned an error response
            const statusCode = error.response.status;
            const message = error.response.data?.message || 'News API error';
            
            if (statusCode === 401) {
                throw new Error('Invalid News API key. Please check your NEWS_API_KEY configuration.');
            } else if (statusCode === 429) {
                throw new Error('News API rate limit exceeded. Please try again later.');
            } else if (statusCode === 400) {
                throw new Error(`Bad request to News API: ${message}`);
            } else {
                throw new Error(`News API error (${statusCode}): ${message}`);
            }
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('No response from News API. Please check your internet connection.');
        } else if (error.message === 'NEWS_API_KEY is not configured in environment variables') {
            throw error;
        } else {
            // Something else went wrong
            throw new Error(`Failed to fetch news: ${error.message}`);
        }
    }
};

// Mark article as read
exports.markArticleAsRead = async (userId, articleId, articleData) => {
    try {
        const interaction = await ArticleInteraction.findOneAndUpdate(
            { userId, articleId },
            {
                isRead: true,
                readAt: new Date(),
                articleTitle: articleData.title,
                articleUrl: articleData.url,
                articleImage: articleData.image || null,
                articleDescription: articleData.description || null,
                source: articleData.source || null
            },
            { new: true, upsert: true }
        );
        return interaction;
    } catch (error) {
        throw new Error(`Failed to mark article as read: ${error.message}`);
    }
};

// Mark article as favorite
exports.markArticleAsFavorite = async (userId, articleId, articleData) => {
    try {
        const interaction = await ArticleInteraction.findOneAndUpdate(
            { userId, articleId },
            {
                isFavorite: true,
                favoritedAt: new Date(),
                articleTitle: articleData.title,
                articleUrl: articleData.url,
                articleImage: articleData.image || null,
                articleDescription: articleData.description || null,
                source: articleData.source || null
            },
            { new: true, upsert: true }
        );
        return interaction;
    } catch (error) {
        throw new Error(`Failed to mark article as favorite: ${error.message}`);
    }
};

// Remove from favorites
exports.removeFavorite = async (userId, articleId) => {
    try {
        const interaction = await ArticleInteraction.findOneAndUpdate(
            { userId, articleId },
            {
                isFavorite: false,
                favoritedAt: null
            },
            { new: true }
        );
        return interaction;
    } catch (error) {
        throw new Error(`Failed to remove favorite: ${error.message}`);
    }
};

// Get all read articles for user
exports.getReadArticles = async (userId) => {
    try {
        const articles = await ArticleInteraction.find({
            userId,
            isRead: true
        }).sort({ readAt: -1 });
        return articles;
    } catch (error) {
        throw new Error(`Failed to fetch read articles: ${error.message}`);
    }
};

// Get all favorite articles for user
exports.getFavoriteArticles = async (userId) => {
    try {
        const articles = await ArticleInteraction.find({
            userId,
            isFavorite: true
        }).sort({ favoritedAt: -1 });
        return articles;
    } catch (error) {
        throw new Error(`Failed to fetch favorite articles: ${error.message}`);
    }
};

// Search articles by keyword (searches cached articles and database)
exports.searchArticles = async (userId, keyword) => {
    try {
        if (!keyword || keyword.trim().length === 0) {
            throw new Error('Search keyword is required');
        }

        // Get all cached news articles
        const allCachedArticles = [];
        for (const [key, value] of Array.from(cacheService.cache.entries())) {
            if (value && value.articles) {
                allCachedArticles.push(...value.articles);
            }
        }

        // Search in cached articles
        const searchRegex = new RegExp(keyword, 'i');
        const matchedCached = allCachedArticles.filter(article => {
            return searchRegex.test(article.title) || 
                   searchRegex.test(article.description || '') ||
                   searchRegex.test(article.author || '');
        });

        // Also search in user's saved interactions
        const matchedSaved = await ArticleInteraction.find({
            userId,
            $or: [
                { articleTitle: { $regex: searchRegex } },
                { articleDescription: { $regex: searchRegex } }
            ]
        });

        return {
            cachedResults: matchedCached,
            savedResults: matchedSaved,
            totalResults: matchedCached.length + matchedSaved.length
        };
    } catch (error) {
        throw new Error(`Failed to search articles: ${error.message}`);
    }
};

// Start periodic cache update
let updateInterval = null;

exports.startPeriodicCacheUpdate = async (intervalMinutes = 30) => {
    try {
        if (updateInterval) {
            console.log('Periodic cache update already running');
            return;
        }

        console.log(`Starting periodic cache update every ${intervalMinutes} minutes`);
        
        // Update cache immediately
        await exports.updateAllCachedNews();

        // Set up interval
        updateInterval = setInterval(async () => {
            console.log('Running periodic cache update...');
            await exports.updateAllCachedNews();
        }, intervalMinutes * 60 * 1000);

    } catch (error) {
        throw new Error(`Failed to start periodic cache update: ${error.message}`);
    }
};

// Update all cached news articles
exports.updateAllCachedNews = async () => {
    try {
        if (!process.env.NEWS_API_KEY) {
            throw new Error('NEWS_API_KEY is not configured');
        }

        const categories = ['technology', 'business', 'health', 'science', 'sports'];
        const languages = ['en'];

        for (const category of categories) {
            for (const language of languages) {
                try {
                    const newsApiUrl = 'https://newsapi.org/v2/top-headlines';
                    const params = {
                        apiKey: process.env.NEWS_API_KEY,
                        category,
                        language,
                        pageSize: 20
                    };

                    const response = await axios.get(newsApiUrl, { 
                        params,
                        timeout: 10000
                    });

                    if (response.data.status === 'ok') {
                        const cacheKey = `news_${category}_${language}`;
                        const newsData = {
                            totalResults: response.data.totalResults,
                            articles: response.data.articles,
                            preferences: {
                                category,
                                language,
                                sources: []
                            },
                            updatedAt: new Date()
                        };
                        await cacheService.set(cacheKey, newsData);
                        console.log(`Cache updated for ${category}-${language}`);
                    }
                } catch (error) {
                    console.error(`Failed to update cache for ${category}-${language}:`, error.message);
                }
            }
        }

        console.log('Periodic cache update completed');
    } catch (error) {
        console.error('Error updating cached news:', error.message);
    }
};

// Stop periodic cache update
exports.stopPeriodicCacheUpdate = () => {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('Periodic cache update stopped');
    }
};
