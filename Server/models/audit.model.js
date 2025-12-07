import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  eventType: { type: String, required: true }, // e.g., "Deepfake Detected", "File Encrypted"
  description: { type: String, required: true }, // e.g., filename
  status: { type: String, enum: ["SUCCESS", "CRITICAL", "WARNING", "INFO"], default: "INFO" },
  timestamp: { type: Date, default: Date.now },
  meta: { type: Object } // Any extra info
});

export const AuditLog = mongoose.model("AuditLog", auditSchema);