// models/Note.js
import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const noteSchema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        userId: { type: Types.ObjectId, ref: "User", required: true },
        tenantId: { type: String, required: true }, // tenant isolation
    },
    { timestamps: true } // adds createdAt & updatedAt automatically
);

// index for fast tenant filtering
noteSchema.index({ tenantId: 1 });

// export the compiled model
export default model("Note", noteSchema);
