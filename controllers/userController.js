const users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Preferences = require('../models/preferencesModel');

// user registration
exports.registerUser = async (userData) => {
    const dbuser = await users.create(userData);
    return dbuser;
}

// user login
exports.loginUser = async (email, password) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    const user = await users.findOne({ email }).select('+password');
    if (!user) {
        throw new Error('Invalid email or password!');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password!');
    }

    console.log('User authenticated successfully:', user);

    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};
