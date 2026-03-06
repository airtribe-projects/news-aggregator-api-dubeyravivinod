// In-memory cache service for news articles
class CacheService {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.cacheDuration = 3600000; // 1 hour in milliseconds
    }

    // Set cache with async/await support
    async set(key, value) {
        try {
            this.cache.set(key, value);
            // Set expiry time
            this.cacheExpiry.set(key, Date.now() + this.cacheDuration);
            console.log(`Cache set for key: ${key}`);
            return true;
        } catch (error) {
            console.error(`Error setting cache for key ${key}:`, error.message);
            return false;
        }
    }

    // Get cache with expiry check
    async get(key) {
        try {
            // Check if key exists and is not expired
            const expiryTime = this.cacheExpiry.get(key);
            
            if (!expiryTime || Date.now() > expiryTime) {
                // Cache expired or doesn't exist
                this.cache.delete(key);
                this.cacheExpiry.delete(key);
                console.log(`Cache expired or not found for key: ${key}`);
                return null;
            }

            const value = this.cache.get(key);
            console.log(`Cache hit for key: ${key}`);
            return value;
        } catch (error) {
            console.error(`Error getting cache for key ${key}:`, error.message);
            return null;
        }
    }

    // Clear specific cache key
    async clear(key) {
        try {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            console.log(`Cache cleared for key: ${key}`);
            return true;
        } catch (error) {
            console.error(`Error clearing cache for key ${key}:`, error.message);
            return false;
        }
    }

    // Clear all cache
    async clearAll() {
        try {
            this.cache.clear();
            this.cacheExpiry.clear();
            console.log('All cache cleared');
            return true;
        } catch (error) {
            console.error('Error clearing all cache:', error.message);
            return false;
        }
    }

    // Get cache size
    getSize() {
        return this.cache.size;
    }

    // Set cache duration (in milliseconds)
    setCacheDuration(duration) {
        this.cacheDuration = duration;
    }
}

// Export singleton instance
module.exports = new CacheService();
