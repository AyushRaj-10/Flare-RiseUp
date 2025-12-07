import express from "express";
import { upload } from "../middleware/upload.middleware.js";
import { uploadFile, getDocuments, updateFileWithNFT } from "../controllers/file.controller.js";

const router = express.Router();

// ✅ Get all documents
router.get("/documents", getDocuments);

// ✅ Update file with NFT information
router.put("/update-nft", express.json(), updateFileWithNFT);

// ✅ Upload file
router.post(
  "/upload",
  upload.single("file"),
  uploadFile
);

export default router;
