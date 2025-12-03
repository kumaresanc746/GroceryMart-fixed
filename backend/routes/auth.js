const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, address } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);

        user = await User.create({
            name,
            email,
            password: hashed,
            address
        });

        res.json({ success: true, user });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: "Invalid email" });

        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ message: "Invalid password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ success: true, token, user });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
