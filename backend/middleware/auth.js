const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Default export → used for user auth
module.exports = async function (req, res, next) {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token)
            return res.status(401).json({ success: false, message: "No token provided" });

        const decoded = jwt.verify(token, JWT_SECRET);

        // user login creates: jwt.sign({ id: user._id })
        const userId = decoded.id || decoded.userId;
        const user = await User.findById(userId).select("-password");

        if (!user)
            return res.status(401).json({ success: false, message: "User not found" });

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

// Extra exports for admin routes
module.exports.authUser = module.exports;

module.exports.authAdmin = async function (req, res, next) {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token)
            return res.status(401).json({ success: false, message: "No token provided" });

        const decoded = jwt.verify(token, JWT_SECRET);

        const adminId = decoded.id || decoded.adminId;
        const admin = await Admin.findById(adminId).select("-password");

        if (!admin)
            return res.status(401).json({ success: false, message: "Admin not found" });

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

module.exports.JWT_SECRET = JWT_SECRET;
