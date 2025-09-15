// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";

const register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Determine tenant from email domain (keeps parity with login)
        const tenantId = email.includes("@acme.test") ? "acme" : "globex";

        // Ensure tenant exists
        const tenant = await Tenant.findOne({ slug: tenantId });
        if (!tenant) {
            return res.status(400).json({ error: "Invalid tenant for provided email" });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create user (unique per tenant enforced by schema)
        let user;
        try {
            user = await User.create({
                email,
                password: hashed,
                role: role || "member",
                tenantId,
            });
        } catch (err) {
            // handle duplicate key (email + tenantId)
            if (err.code === 11000) {
                return res.status(409).json({ error: "User already exists for this tenant" });
            }
            throw err;
        }

        const token = jwt.sign(
            { userId: user._id, tenantId: user.tenantId, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
        });
        console.log(token, user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Extract tenant from email domain
        const tenantId = email.includes("@acme.test") ? "acme" : "globex";

        const user = await User.findOne({ email, tenantId });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id, tenantId: user.tenantId, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

export { register, login };
