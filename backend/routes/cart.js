const express = require("express");
const router = express.Router();
const { authUser } = require("../middleware/auth");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Get user cart
router.get("/", authUser, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate("items.productId");

        return res.json({
            success: true,
            cart: cart || { userId: req.user._id, items: [] }
        });
    } catch (error) {
        console.error("Cart GET error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Add to cart
router.post("/add", authUser, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Check product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({ success: false, message: "Product not found" });
        }

        let cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            cart = new Cart({
                userId: req.user._id,
                items: [{ productId, quantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (i) => i.productId.toString() === productId
            );

            if (itemIndex >= 0) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, quantity });
            }
        }

        await cart.save();
        res.json({ success: true, message: "Item added to cart" });

    } catch (error) {
        console.error("Cart ADD error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// Remove item
router.delete("/remove/:id", authUser, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id });

        if (!cart) {
            return res.json({ success: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== req.params.id
        );

        await cart.save();

        res.json({ success: true, message: "Item removed" });
    } catch (error) {
        console.error("Cart REMOVE error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;
