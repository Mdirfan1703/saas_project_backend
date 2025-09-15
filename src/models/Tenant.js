// models/Tenant.js (ES6 version)
import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    subscription: { type: String, enum: ["free", "pro"], default: "free" },
    noteLimit: { type: Number, default: 3 },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Tenant", tenantSchema);
