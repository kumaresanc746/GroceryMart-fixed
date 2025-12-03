const mongoose = require("mongoose");
const Admin = require("./models/Admin");
require("dotenv").config();

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://mongo:27017/grocery-store");
        console.log("Mongo connected");

        // delete old admins
        await Admin.deleteMany({});

        // new admin
        const admin = new Admin({
            name: "Super Admin",
            email: "admin@gmail.com",
            password: "admin123"
        });

        await admin.save();

        console.log("Admin created:", {
            id: admin._id,
            email: admin.email
        });

        mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
}

createAdmin();
