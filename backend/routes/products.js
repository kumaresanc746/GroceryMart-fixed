const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get products
router.get('/', async (req, res) => {
    try {
        const { limit, category, search } = req.query;

        let query = {};

        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };

        const products = await Product.find(query).limit(parseInt(limit) || 0);

        res.json({ success: true, products });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get product details
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ success: true, product });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
