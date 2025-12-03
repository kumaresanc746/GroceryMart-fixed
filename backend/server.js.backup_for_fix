const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
// Allow preflight for all routes
app.options('*', cors({ origin: true, credentials: true }));
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongo:27017/grocery-store';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// =====================
// Load User Routes
// =====================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/user', require('./routes/user'));

// =====================
// Load Admin Routes (ALL FILES)
// =====================
app.use('/api/admin', require('./routes/admin'));        // dashboard routes
app.use('/api/admin', require('./routes/adminLogin'));   // login route
app.use('/api/admin', require('./routes/adminAuth'));    // JWT verify

// =====================
// Health Check
// =====================
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
