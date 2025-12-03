const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email already exists" });

        // Using model pre-save hook to hash password
        user = new User({ name, email, password, address });
        await user.save();

        return res.json({ success: true, message: 'User created successfully' });
    } catch (err) {
        console.error('SIGNUP ERROR:', err);
        res.status(500).json({ message: "Server error" });
    }
});

// Login with auto-fix for legacy plaintext passwords
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid email or password" });

        // First try bcrypt compare
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '7d' });
            return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
        }

        // If bcrypt failed, check if stored password is plain-text (legacy).
        if (password === user.password) {
            // Re-hash and save the password securely, then return token
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '7d' });
            return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
        }

        return res.status(401).json({ message: "Invalid password" });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
