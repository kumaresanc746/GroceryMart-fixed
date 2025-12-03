const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

// ----------------------------------
// GET USER CART
// ----------------------------------
router.get("/", auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id })
            .populate("items.productId", "name price image stock");

        if (!cart) {
            return res.json({
                success: true,
                cart: { items: [], totalAmount: 0 }
            });
        }

        // Calculate total
        let totalAmount = 0;

        const formattedItems = cart.items.map(item => {
            const product = item.productId;

            // Product exists
            if (product) {
                totalAmount += item.quantity * product.price;
                return {
                    ...item._doc,
                    productId: {
                        ...product._doc,
                        image: product.image || "/images/default.png"
                    }
                };
            }

            // Product was deleted
            return {
                ...item._doc,
                productId: {
                    name: "Product removed",
                    price: 0,
                    image: "/images/default.png"
                }
            };
        });

        res.json({
            success: true,
            cart: {
                items: formattedItems,
                totalAmount
            }
        });

    } catch (err) {
        console.error("Cart Load Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ----------------------------------
// ADD / UPDATE ITEM IN CART
// ----------------------------------
router.post("/add", auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId) return res.status(400).json({ message: "Product ID required" });

        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        const existing = cart.items.find(item => item.productId.toString() === productId);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();

        res.json({ success: true, message: "Added to cart" });
    } catch (err) {
        console.error("Add Cart Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ----------------------------------
// REMOVE ITEM
// ----------------------------------
router.delete("/:productId", auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) return res.json({ success: true });

        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);

        await cart.save();

        res.json({ success: true });
    } catch (err) {
        console.error("Remove Cart Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
