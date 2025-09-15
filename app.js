import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import authRoutes from "./src/routes/auth.js";
import notesRoutes from "./src/routes/notes.js";
import tenantRoutes from "./src/routes/tenants.js";
import User from "./src/models/User.js";
import Tenant from "./src/models/Tenant.js";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/tenants", tenantRoutes);

// Seed initial data function
const seedData = async () => {
    try {
        console.log("Starting data seeding...");
        
        // Create tenants
        await Tenant.findOneAndUpdate(
            { slug: "acme" },
            { name: "Acme Corp", subscription: "free", noteLimit: 3 },
            { upsert: true }
        );

        await Tenant.findOneAndUpdate(
            { slug: "globex" },
            { name: "Globex Corporation", subscription: "free", noteLimit: 3 },
            { upsert: true }
        );

        // Create test users
        const hashedPassword = await bcrypt.hash("password", 10);
        const testUsers = [
            { email: "admin@acme.test", role: "admin", tenantId: "acme" },
            { email: "user@acme.test", role: "member", tenantId: "acme" },
            { email: "admin@globex.test", role: "admin", tenantId: "globex" },
            { email: "user@globex.test", role: "member", tenantId: "globex" },
        ];

        for (const userData of testUsers) {
            await User.findOneAndUpdate(
                { email: userData.email, tenantId: userData.tenantId },
                { ...userData, password: hashedPassword },
                { upsert: true }
            );
        }
        
        console.log("Data seeding completed successfully");
    } catch (error) {
        console.error("Error seeding data:", error);
    }
};

// Database connection with proper async handling
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
        });
        
        console.log("Connected to MongoDB");
        
        // Seed data only after successful connection
        await seedData();
        
    } catch (err) {
        console.error("MongoDB connection error:", err);
        // Don't exit the process in development, just log the error
        console.error("Server will continue running, but database operations will fail");
    }
};

// Connect to database
// Only connect when running the server (both serverless and local will call this)
// Export the app so serverless wrappers can use it without starting a listener here.
connectDB();

export default app;
