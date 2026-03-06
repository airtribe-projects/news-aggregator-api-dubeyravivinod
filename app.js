const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.URI;

// Import Mongoose and connect to MongoDB
const mongoose = require('mongoose');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Import and use the routes
const userRoutes = require("./routes/userRoutes");
const userPreferenceRoutes = require("./routes/userPreference");
const newsRoutes = require("./routes/newsRoutes");
const { startPeriodicCacheUpdate } = require("./controllers/newsController");

// Mount the user routes at /api/v1/users
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/preferences", userPreferenceRoutes);
app.use("/api/v1", newsRoutes);

// Home Page
app.get('/', (req, res) => {
    res.send('Welcome to the News Aggregator API');
});


// Mount the Mongoose connection
mongoose.connect(uri).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
}).then(() => {
    // Start the server after successful connection to MongoDB
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        
        // Start periodic cache update (every 30 minutes)
        startPeriodicCacheUpdate(30).catch(err => {
            console.error('Failed to start periodic cache update:', err.message);
        });
    });
});
