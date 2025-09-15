// models/User.js  (ES Module format)
import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const userSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    tenantId: { type: String, required: true }, // tenant isolation
    createdAt: { type: Date, default: Date.now },
});

// compound index for unique e-mail within each tenant
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

// reuse existing model in dev/hot-reload to avoid OverwriteModelError
const User = models.User || model("User", userSchema);

export default User;
