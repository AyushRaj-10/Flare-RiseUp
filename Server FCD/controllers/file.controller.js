import { uploadToIPFS } from "../services/ipfs.service.js";
import { saveFileMetadata, File } from "../models/file.model.js";
import crypto from "crypto";
import fs from "fs";

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: "File is required" });
    }

    console.log("📁 File received:", {
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });

    // Get wallet address from request body or use default
    const walletAddress = req.body.owner;
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: "Wallet address (owner) is required" 
      });
    }

    // File is already encrypted by frontend, so we:
    // 1. Hash the encrypted file
    const fileBuffer = fs.readFileSync(file.path);
    const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    console.log("🔐 File hash:", fileHash);

    // 2. Upload encrypted file to IPFS
    console.log("📤 Uploading to IPFS...");
    let cid;
    try {
      cid = await uploadToIPFS(file.path);
      console.log("✅ IPFS CID:", cid);
    } catch (ipfsError) {
      console.error("❌ IPFS upload failed:", ipfsError.message);
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      throw new Error(`IPFS upload failed: ${ipfsError.message}`);
    }

    // 3. Save to MongoDB (NFT minting happens on frontend)
    const fileDoc = await saveFileMetadata({
      name: file.originalname || file.filename,
      cid,
      hash: fileHash,
      owner: walletAddress.toLowerCase(),
      txHash: "pending", // Will be updated when NFT is minted on frontend
    });
    console.log("✅ Saved to database:", fileDoc._id);

    // Clean up uploaded file after IPFS upload
    try {
      fs.unlinkSync(file.path);
      console.log("✅ Temporary file cleaned up");
    } catch (cleanupError) {
      console.warn("⚠️ Could not delete temporary file:", cleanupError.message);
    }

    // ✅ Final response
    res.json({
      success: true,
      message: "File uploaded and stored on IPFS successfully",
      cid,
      hash: fileHash,
      file: fileDoc,
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// ✅ Update file with NFT information (called after NFT is minted)
export const updateFileWithNFT = async (req, res) => {
  console.log("📝 updateFileWithNFT called with:", req.body);
  try {
    const { fileId, tokenId, daoAddress, txHash } = req.body;

    if (!fileId || !tokenId || !txHash) {
      console.error("❌ Missing required fields:", { fileId, tokenId, txHash });
      return res.status(400).json({
        success: false,
        error: "fileId, tokenId, and txHash are required"
      });
    }

    console.log("🔍 Looking for file with ID:", fileId);
    const file = await File.findByIdAndUpdate(
      fileId,
      {
        tokenId: Number(tokenId),
        daoAddress,
        txHash,
      },
      { new: true }
    );

    if (!file) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    console.log("✅ File updated with NFT info:", { fileId, tokenId, txHash });

    res.json({
      success: true,
      message: "File updated with NFT information",
      file,
    });
  } catch (err) {
    console.error("❌ Error updating file with NFT:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get all documents for a user
export const getDocuments = async (req, res) => {
  try {
    const { owner } = req.query;

    let query = {};
    if (owner) {
      query.owner = owner.toLowerCase();
    }

    const files = await File.find(query).sort({ uploadedAt: -1 });

    res.json({
      success: true,
      documents: files,
      count: files.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
