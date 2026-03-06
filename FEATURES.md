# News Aggregator API - Advanced Features Implementation

## Features Implemented

### 1. Caching Mechanism ✅
**File:** `services/cacheService.js`
- In-memory cache with async/await support
- Automatic expiry (1 hour default)
- Cache key generation per category/language
- Cache hit/miss logging
- Methods included:
  - `set(key, value)` - Store data with auto-expiry
  - `get(key)` - Retrieve data with expiry check
  - `clear(key)` - Clear specific cache
  - `clearAll()` - Clear all cache
  - `getSize()` - Get cache size
  - `setCacheDuration(duration)` - Set expiry duration

### 2. Article Interactions (Read/Favorite) ✅
**File:** `models/articleInteractionModel.js`
**Database Schema Includes:**
- `userId` - Reference to User
- `articleId` - Unique article identifier
- `isRead` - Boolean flag for read status
- `isFavorite` - Boolean flag for favorite status
- `readAt` - Timestamp when marked as read
- `favoritedAt` - Timestamp when marked as favorite
- Article metadata (title, URL, image, description, source)

### 3. News Endpoints ✅
**File:** `routes/newsRoutes.js`

#### Protected Endpoints (Require JWT):
1. **GET /api/v1/news**
   - Fetch news based on user preferences
   - Returns cached data if available
   - Includes `fromCache` flag in response

2. **POST /api/v1/news/:id/read**
   - Mark article as read
   - Request body: `{ title, url, image, description, source }`

3. **POST /api/v1/news/:id/favorite**
   - Mark article as favorite
   - Request body: `{ title, url, image, description, source }`

4. **DELETE /api/v1/news/:id/favorite**
   - Remove article from favorites

5. **GET /api/v1/news/read**
   - Retrieve all read articles for user
   - Sorted by read date (newest first)

6. **GET /api/v1/news/favorites**
   - Retrieve all favorite articles for user
   - Sorted by favorite date (newest first)

7. **GET /api/v1/news/search/:keyword**
   - Search articles by keyword
   - Searches in cached articles and saved interactions
   - Case-insensitive regex search

### 4. Periodic Cache Updates ✅
**File:** `controllers/newsController.js`
**Features:**
- `startPeriodicCacheUpdate(intervalMinutes)` - Starts background updates
- `updateAllCachedNews()` - Updates cache for all categories
- `stopPeriodicCacheUpdate()` - Stops the interval
- Default: Updates every 30 minutes
- Covers categories: technology, business, health, science, sports

### 5. Error Handling ✅
All endpoints include comprehensive error handling:
- Missing/Invalid API key (500)
- Rate limit exceeded (429)
- Network/Connection errors (503)
- Bad requests (400)
- Validation errors (400)
- Database errors (500)

## Usage Examples

### 1. Fetch News (with caching)
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/news
```

### 2. Mark Article as Read
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Article Title",
    "url": "https://example.com/article",
    "image": "https://example.com/image.jpg",
    "description": "Article description",
    "source": "BBC News"
  }' \
  http://localhost:3000/api/v1/news/article123/read
```

### 3. Mark Article as Favorite
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Article Title",
    "url": "https://example.com/article"
  }' \
  http://localhost:3000/api/v1/news/article123/favorite
```

### 4. Get All Favorites
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/news/favorites
```

### 5. Search Articles
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/news/search/artificial%20intelligence
```

## Technical Implementation

### Async/Await Throughout
- All API calls use async/await pattern
- All database operations use async/await
- Cache operations promise-based with async/await

### Cache Flow
1. User requests news → Check cache
2. Cache hit → Return cached data with `fromCache: true`
3. Cache miss → Fetch from NewsAPI
4. Store in cache for 1 hour
5. Return fresh data with `fromCache: false`

### Periodic Update Flow
1. Server starts → Periodic update starts (every 30 minutes)
2. Background job fetches news for all categories
3. Updates cache for each category/language combination
4. Logs success/failure for each update

## Files Created/Modified

**New Files:**
- `services/cacheService.js` - Caching service
- `models/articleInteractionModel.js` - Article interaction model
- `controllers/newsController.js` - Enhanced with new features
- `routes/newsRoutes.js` - Enhanced with new endpoints

**Modified Files:**
- `app.js` - Starts periodic cache update on server startup

## Database Indexes
- `ArticleInteraction`: Compound index on `(userId, articleId)` for performance

## Configuration
- Cache duration: 1 hour (configurable)
- Periodic update interval: 30 minutes (configurable in app.js)
- NEWS_API_KEY: Required in `.env` file
