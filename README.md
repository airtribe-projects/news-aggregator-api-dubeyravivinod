# News Aggregator API

A modern RESTful API for aggregating and managing news articles with user preferences, caching, and personalized content delivery.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Project Structure](#project-structure)

## 📌 Overview

The News Aggregator API is a backend service that aggregates news articles from the NewsAPI and provides personalized content based on user preferences. It includes features like:

- **User Authentication** with JWT tokens
- **Personalized Preferences** (categories, languages, sources)
- **Smart Caching** with automatic refresh
- **Article Management** (mark as read/favorite)
- **Full-Text Search** across articles
- **Periodic Updates** for real-time news

## ✨ Features

### ✅ User Authentication & Authorization
- User registration and login
- JWT-based authentication
- Protected endpoints with Bearer token

### ✅ User Preferences Management
- Store preferred news categories (technology, business, health, science, sports, entertainment, politics)
- Language preferences (en, es, fr, de, zh, ja)
- Custom news sources
- Notification settings

### ✅ News Aggregation
- Fetch news articles from NewsAPI
- Filter by user preferences
- Support for multiple categories and languages
- Configurable page size

### ✅ Intelligent Caching
- 1-hour cache duration (configurable)
- Automatic cache expiration
- Cache hit/miss tracking
- Lightweight in-memory storage

### ✅ Article Interactions
- Mark articles as read
- Add/remove articles from favorites
- Retrieve read articles history
- Retrieve favorite articles

### ✅ Search Functionality
- Search across cached articles
- Search user's saved interactions
- Case-insensitive keyword matching
- Real-time search results

### ✅ Periodic Updates
- Background cache refresh (default: every 30 minutes)
- Covers 5 major news categories
- Non-blocking operations
- Automatic error recovery

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB** (local or cloud - MongoDB Atlas)
- **Internet connection** (for NewsAPI access)

## 📦 Installation

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd news-aggregator-api
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `axios` - HTTP client for API requests
- `dotenv` - Environment variable management

### Step 3: Verify Installation
```bash
npm list
```

## ⚙️ Configuration

### Step 1: Create `.env` File
Create a `.env` file in the root directory:
```bash
touch .env
```

### Step 2: Configure Environment Variables
```env
# MongoDB Connection
URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?appName=<appName>

# Server Port
PORT=3000

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_secret_key_here

# NewsAPI Configuration
NEWS_API_KEY=your_newsapi_key_from_newsapi.org
```

### Getting Required Keys

#### MongoDB Connection String:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`

#### NewsAPI Key:
1. Visit [NewsAPI.org](https://newsapi.org)
2. Sign up for a free account
3. Copy your API key from the dashboard

#### JWT Secret:
Generate a strong random string:
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## 🚀 Running the Server

### Development Mode
```bash
npm start
```

Expected output:
```
Connected to MongoDB
Server is running on port 3000
Starting periodic cache update every 30 minutes
```

### With Nodemon (Auto-reload)
```bash
npm install --save-dev nodemon
npx nodemon app.js
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Public Endpoints (No Authentication Required)

#### 1. User Registration
```http
POST /users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-03-06T10:00:00Z"
  }
}
```

---

#### 2. User Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints (Require JWT Token)

**Authorization Header Required:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

#### 3. Get User Profile
```http
GET /users/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Authenticated user profile",
  "user": {
    "userId": "user_id",
    "username": "john_doe",
    "role": "user"
  }
}
```

---

### Preferences Endpoints

#### 4. Get User Preferences
```http
GET /preferences/preferences
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "User preferences fetched successfully",
  "preferences": {
    "_id": "pref_id",
    "userId": "user_id",
    "categories": ["technology"],
    "languages": ["en"],
    "sources": [],
    "notificationsEnabled": true,
    "updatedAt": "2024-03-06T10:00:00Z"
  }
}
```

---

#### 5. Update User Preferences
```http
PUT /preferences/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "categories": ["technology", "business"],
  "languages": ["en", "es"],
  "notificationsEnabled": true,
  "sources": ["bbc-news", "cnn"]
}
```

**Response (200 OK):**
```json
{
  "message": "User preferences updated successfully",
  "preferences": {
    "_id": "pref_id",
    "userId": "user_id",
    "categories": ["technology", "business"],
    "languages": ["en", "es"],
    "sources": ["bbc-news", "cnn"],
    "notificationsEnabled": true,
    "updatedAt": "2024-03-06T10:30:00Z"
  }
}
```

---

### News Endpoints

#### 6. Get News Articles
Fetches news based on user preferences with intelligent caching.

```http
GET /news
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "News articles fetched successfully",
  "total": 20,
  "fromCache": true,
  "preferences": {
    "category": "technology",
    "language": "en",
    "sources": []
  },
  "articles": [
    {
      "source": { "id": "techcrunch", "name": "TechCrunch" },
      "author": "John Smith",
      "title": "New AI Breakthrough",
      "description": "Researchers announce...",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "publishedAt": "2024-03-06T09:00:00Z",
      "content": "Full article content..."
    }
  ]
}
```

---

#### 7. Mark Article as Read
```http
POST /news/:articleId/read
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New AI Breakthrough",
  "url": "https://example.com/article",
  "image": "https://example.com/image.jpg",
  "description": "Researchers announce...",
  "source": "TechCrunch"
}
```

**Response (200 OK):**
```json
{
  "message": "Article marked as read",
  "interaction": {
    "_id": "interaction_id",
    "userId": "user_id",
    "articleId": "article_123",
    "articleTitle": "New AI Breakthrough",
    "isRead": true,
    "isFavorite": false,
    "readAt": "2024-03-06T10:30:00Z"
  }
}
```

---

#### 8. Mark Article as Favorite
```http
POST /news/:articleId/favorite
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New AI Breakthrough",
  "url": "https://example.com/article",
  "image": "https://example.com/image.jpg",
  "description": "Researchers announce...",
  "source": "TechCrunch"
}
```

**Response (200 OK):**
```json
{
  "message": "Article added to favorites",
  "interaction": {
    "_id": "interaction_id",
    "userId": "user_id",
    "articleId": "article_123",
    "articleTitle": "New AI Breakthrough",
    "isRead": true,
    "isFavorite": true,
    "favoritedAt": "2024-03-06T10:31:00Z"
  }
}
```

---

#### 9. Remove Article from Favorites
```http
DELETE /news/:articleId/favorite
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Article removed from favorites",
  "interaction": {
    "_id": "interaction_id",
    "userId": "user_id",
    "articleId": "article_123",
    "isFavorite": false,
    "favoritedAt": null
  }
}
```

---

#### 10. Get Read Articles
```http
GET /news/read
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Read articles retrieved successfully",
  "total": 5,
  "articles": [
    {
      "_id": "interaction_id",
      "articleTitle": "New AI Breakthrough",
      "articleUrl": "https://example.com/article",
      "isRead": true,
      "readAt": "2024-03-06T10:30:00Z"
    }
  ]
}
```

---

#### 11. Get Favorite Articles
```http
GET /news/favorites
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Favorite articles retrieved successfully",
  "total": 3,
  "articles": [
    {
      "_id": "interaction_id",
      "articleTitle": "New AI Breakthrough",
      "articleUrl": "https://example.com/article",
      "isFavorite": true,
      "favoritedAt": "2024-03-06T10:31:00Z"
    }
  ]
}
```

---

#### 12. Search Articles
Search across cached and saved articles by keyword.

```http
GET /news/search/artificial%20intelligence
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Search completed successfully",
  "keyword": "artificial intelligence",
  "totalResults": 8,
  "cachedResults": [
    {
      "title": "AI Revolution 2024",
      "description": "Exploring artificial intelligence trends...",
      "url": "https://example.com/article1"
    }
  ],
  "savedResults": [
    {
      "_id": "interaction_id",
      "articleTitle": "AI Ethics Discussion",
      "articleDescription": "Discussing artificial intelligence ethics..."
    }
  ]
}
```

---

## 🔐 Authentication

### JWT Token Format

The API uses JWT (JSON Web Tokens) for authentication.

**Token Structure:**
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "user_id_from_mongodb",
  "username": "john_doe",
  "role": "user",
  "iat": 1709714400,
  "exp": 1709718000
}

Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

**Token Expiry:** 1 hour

### Using the Token

Include the token in every protected request:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/v1/news
```

Or using JavaScript/Axios:
```javascript
const response = await axios.get('http://localhost:3000/api/v1/news', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## ⚠️ Error Handling

The API uses standard HTTP status codes and detailed error messages:

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful request |
| 201 | Created | User registered successfully |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid or missing token |
| 429 | Too Many Requests | API rate limit exceeded |
| 500 | Server Error | Database error |
| 503 | Service Unavailable | NewsAPI unreachable |

### Error Response Format

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common Errors

#### Missing JWT Token
```json
{
  "message": "Access token is required",
  "statusCode": 401
}
```

#### Invalid Credentials
```json
{
  "message": "Invalid email or password",
  "error": "Invalid email or password!"
}
```

#### NewsAPI Rate Limit
```json
{
  "message": "Too many requests",
  "error": "News API rate limit exceeded. Please try again later.",
  "statusCode": 429
}
```

#### Invalid API Key
```json
{
  "message": "Server configuration error",
  "error": "Invalid News API credentials"
}
```

---

## 📁 Project Structure

```
news-aggregator-api/
├── app.js                          # Main application file
├── package.json                    # Dependencies
├── .env                            # Environment variables (not in repo)
├── README.md                       # This file
├── FEATURES.md                     # Detailed features documentation
│
├── models/                         # Database Schemas
│   ├── userModel.js               # User schema
│   ├── preferencesModel.js        # User preferences schema
│   └── articleInteractionModel.js # Article read/favorite tracking
│
├── controllers/                    # Business Logic
│   ├── userController.js          # User registration & login
│   ├── preferencesController.js   # Preferences management
│   └── newsController.js          # News fetching & caching logic
│
├── routes/                        # API Routes
│   ├── userRoutes.js             # User endpoints
│   ├── userPreference.js         # Preference endpoints
│   └── newsRoutes.js             # News endpoints
│
├── middleware/                    # Custom Middleware
│   └── authMiddleware.js         # JWT authentication
│
├── services/                      # Utility Services
│   └── cacheService.js           # In-memory caching
│
└── test/                         # Test Files
    └── server.test.js            # API tests
```

---

## 🔄 Caching Strategy

### Cache Flow

1. **User Request** → Check cache
2. **Cache Hit** → Return cached data with `fromCache: true`
3. **Cache Miss** → Fetch from NewsAPI
4. **Store** → Cache for 1 hour
5. **Return** → Fresh data with `fromCache: false`

### Cache Keys
```
Format: news_{category}_{language}
Example: news_technology_en
```

### Automatic Updates
- Periodic refresh every 30 minutes
- Covers 5 categories: technology, business, health, science, sports
- Runs automatically on server startup
- Non-blocking background operation

---

## 📊 Database Models

### User Model
```javascript
{
  username: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (default: 'user'),
  createdAt: Date (default: now)
}
```

### Preferences Model
```javascript
{
  userId: ObjectId (reference to User),
  categories: [String],
  languages: [String],
  sources: [String],
  notificationsEnabled: Boolean,
  updatedAt: Date
}
```

### Article Interaction Model
```javascript
{
  userId: ObjectId (reference to User),
  articleId: String,
  articleTitle: String,
  articleUrl: String,
  isRead: Boolean,
  isFavorite: Boolean,
  readAt: Date,
  favoritedAt: Date,
  createdAt: Date
}
```

---

## 🐛 Troubleshooting

### Connection Errors

**Problem:** `Error connecting to MongoDB`
```
Solution: 
1. Check MongoDB URI in .env
2. Verify internet connection
3. Check MongoDB Atlas IP whitelist
4. Ensure database credentials are correct
```

**Problem:** `NEWS_API_KEY is not configured`
```
Solution:
1. Add NEWS_API_KEY to .env file
2. Verify the key is valid from newsapi.org
3. Restart the server
```

### Authentication Issues

**Problem:** `Invalid or expired token`
```
Solution:
1. Login again to get a fresh token
2. Check token hasn't expired (1 hour validity)
3. Ensure Bearer prefix is in Authorization header
```

**Problem:** `Invalid News API key`
```
Solution:
1. Visit https://newsapi.org/account
2. Regenerate your API key
3. Update .env file
4. Restart server
```

---

## 📈 Performance Tips

1. **Caching**: Cache is 1-hour by default - adjust in `cacheService.js` if needed
2. **Pagination**: NewsAPI supports pageSize parameter - modify in `newsController.js`
3. **Database Indexes**: Compound index on `(userId, articleId)` for faster queries
4. **Connection Pooling**: Mongoose handles connection pooling automatically

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Contributors

- Ravi Vinod Dubey

---

## 📞 Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Review error messages in logs
3. Verify .env configuration
4. Check API endpoint parameters

---

## 🔗 Useful Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [NewsAPI Documentation](https://newsapi.org/docs)
- [Axios Documentation](https://axios-http.com/)

---

**Last Updated:** March 6, 2026
**API Version:** 1.0.0
