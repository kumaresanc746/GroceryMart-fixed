const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// -------------------- ADMIN LOGIN --------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, {
            expiresIn: "1d"
        });

        res.json({ success: true, token, admin });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// -------------------- VERIFY ADMIN --------------------
function verifyAdmin(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Not admin" });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

// -------------------- PRODUCTS --------------------

// Get all products
router.get('/products', verifyAdmin, async (req, res) => {
    const products = await Product.find();
    res.json({ success: true, products });
});

// ADD product  (THIS FIXES YOUR 404 ERROR!)
router.post('/products/add', verifyAdmin, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({ success: true, product: newProduct });
    } catch (err) {
        console.log("Admin Add Product Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Update product
router.put('/products/:id', verifyAdmin, async (req, res) => {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product: updated });
});

// Delete product
router.delete('/products/:id', verifyAdmin, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// -------------------- USERS --------------------
router.get('/users', verifyAdmin, async (req, res) => {
    const users = await User.find();
    res.json({ success: true, users });
});

// -------------------- ORDERS --------------------
router.get('/orders', verifyAdmin, async (req, res) => {
    const orders = await Order.find()
        .populate("user")
        .populate("items.product");

    res.json({ success: true, orders });
});

module.exports = router;
