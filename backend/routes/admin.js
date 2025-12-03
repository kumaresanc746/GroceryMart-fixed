const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { authAdmin } = require('../middleware/auth');

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// ------------------ ADMIN LOGIN ------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password required" });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: "Invalid email" });
        }

        if (admin.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { adminId: admin._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Admin Login Successful",
            token
        });

    } catch (err) {
        console.error("Admin Login Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// ------------------ GET ALL PRODUCTS ------------------
router.get('/products', authAdmin, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ------------------ ADD PRODUCT ------------------
router.post('/products/add', authAdmin, async (req, res) => {
    try {
        const { name, category, price, stock, description, image } = req.body;

        const product = new Product({
            name,
            category,
            price,
            stock,
            description,
            image: image || 'https://via.placeholder.com/300'
        });

        await product.save();
        res.status(201).json({ success: true, product });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ------------------ UPDATE PRODUCT ------------------
router.put('/products/:id', authAdmin, async (req, res) => {
    try {
        const update = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        );

        res.json({ success: true, product: updatedProduct });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ------------------ DELETE PRODUCT ------------------
router.delete('/products/:id', authAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ GET USERS ------------------
router.get('/users', authAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ GET ALL ORDERS ------------------
router.get('/orders', authAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email address')
            .populate('items.product', 'name image price');

        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ------------------ UPDATE ORDER ------------------
router.put('/orders/:id', authAdmin, async (req, res) => {
    try {
        const update = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true }
        )
            .populate('user', 'name email address')
            .populate('items.product', 'name image price');

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
