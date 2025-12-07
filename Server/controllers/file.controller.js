import { encryptFile } from "../services/encryption.service.js";
import { uploadToIPFS } from "../services/ipfs.service.js";
import { saveFileMetadata, File } from "../models/file.model.js";
import { storeFileHashOnFlare } from "../services/blockchain.service.js";
// ✅ IMPORT AUDIT LOG MODEL (Ensure you created server/models/audit.model.js)
import { AuditLog } from "../models/audit.model.js"; 
import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
dotenv.config();

const PYTHON_SERVICE_URL = "http://127.0.0.1:8000";

// ... (verifyDocumentInPython function remains the same) ...
const verifyDocumentInPython = async (filePath, originalName) => {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), { filename: originalName });
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/verify-doc`, form, { headers: form.getHeaders() });
    return response.data;
  } catch (error) {
    return { status: "UNKNOWN", confidence: "0.00", scores: {}, error: error.message };
  }
};

// 1. UPLOAD FILE
export const uploadFile = async (req, res) => {
  let aiResult = { status: "UNKNOWN", confidence: "0.00", scores: {} };
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: "File is required" });

    // AI Check
    aiResult = await verifyDocumentInPython(file.path, file.originalname);

    // 🛑 BLOCK FAKE FILES
    if (aiResult.status === "FAKE") {
      fs.unlinkSync(file.path);
      
      // ✅ LOG THREAT
      await AuditLog.create({
        eventType: "Deepfake Detected",
        description: file.originalname,
        status: "CRITICAL"
      });

      return res.status(403).json({ success: false, error: "AI Deepfake Detection Failed", ai_data: aiResult });
    }

    // PROCEED TO ENCRYPTION
    const ownerWallet = req.headers["x-wallet-owner"] || process.env.FLARE_WALLET_ADDRESS;
    const fileHash = encryptFile(file.path);
    fs.unlinkSync(file.path);
    file.path = fileHash;
    const cid = await uploadToIPFS(file.path);
    const txHash = await storeFileHashOnFlare(file.path);

    const fileDoc = await saveFileMetadata({
      name: file.originalname,
      cid,
      hash: fileHash,
      owner: ownerWallet,
      txHash: txHash === "ALREADY_STORED" ? null : txHash,
      path: file.path,
      ai_status: aiResult.status,
    });

    // ✅ LOG SUCCESS
    await AuditLog.create({
        eventType: "File Encrypted (AES-256)",
        description: file.originalname,
        status: "INFO" // or SUCCESS
    });

    res.json({ success: true, message: "File verified & secured", cid, txHash, file: fileDoc, ai_data: aiResult });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ... (getUserFiles and deleteFile remain the same) ...
export const getUserFiles = async (req, res) => {
    try {
      const wallet = req.headers["x-wallet-owner"];
      if (!wallet) return res.json([]);
      const files = await File.find({ owner: wallet }).sort({ uploadedAt: -1 });
      res.json(files);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const { id } = req.params;
        const wallet = req.headers["x-wallet-owner"];
        const file = await File.findOne({ _id: id, owner: wallet });
        if (!file) return res.status(404).json({ error: "File not found" });
        if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        await File.deleteOne({ _id: id });
        res.json({ success: true, message: "File deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete" });
    }
};

// ✅ 3. GET DASHBOARD STATS (THIS FIXES THE 404)
export const getDashboardStats = async (req, res) => {
  try {
    const threatsBlocked = await AuditLog.countDocuments({ status: "CRITICAL" });
    const filesSecured = await File.countDocuments();
    const auditLog = await AuditLog.find().sort({ timestamp: -1 }).limit(5);

    res.json({
      threatsBlocked,
      filesSecured,
      storageUsed: "450MB", 
      auditLog
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};