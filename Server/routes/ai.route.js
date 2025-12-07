import express from "express";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { decryptFile } from "../services/encryption.service.js";
import { File } from "../models/file.model.js";

const router = express.Router();
const PYTHON_SERVICE_URL = "http://127.0.0.1:7000"; 

// 1. INITIALIZE CHAT
router.post("/init", async (req, res) => {
  try {
    const { fileId } = req.body;
    console.log(`🤖 AI Init requested for file ID: ${fileId}`);

    const fileRecord = await File.findById(fileId);
    if (!fileRecord) return res.status(404).json({ error: "File record not found" });

    // Prefer 'hash' (encrypted path) as the source
    const encryptedPath = fileRecord.hash || fileRecord.path;

    if (!encryptedPath || !fs.existsSync(encryptedPath)) {
        return res.status(404).json({ error: "Encrypted file not found on server disk" });
    }

    // Decrypt locally
    const decryptedPath = decryptFile(encryptedPath); 

    // Send to Python
    const form = new FormData();
    
    // ✅ FIX: Force the filename to match the original name (e.g., "report.pdf")
    // This tricks the Python server into accepting the .dec file content as a PDF
    form.append("file", fs.createReadStream(decryptedPath), {
      filename: fileRecord.name || "document.pdf", 
      contentType: 'application/pdf'
    });

    await axios.post(`${PYTHON_SERVICE_URL}/upload`, form, {
      headers: { ...form.getHeaders() }
    });

    // Cleanup
    if (fs.existsSync(decryptedPath)) fs.unlinkSync(decryptedPath);
    console.log("✅ AI Knowledge Base Updated");

    res.json({ success: true, message: "AI Ready" });

  } catch (err) {
    console.error("❌ AI Init Error:", err.message);
    if (err.response) {
        console.error("   Python Server Response:", err.response.data);
    }
    res.status(500).json({ error: err.message });
  }
});
// 2. CHAT
router.post("/chat", express.json(), async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.get(`${PYTHON_SERVICE_URL}/ask`, {
      params: { question: message }
    });
    res.json({ reply: response.data.answer });
  } catch (err) {
    console.error("❌ AI Chat Error:", err.message);
    res.json({ reply: "⚠️ AI Service Error" });
  }
});

export default router;