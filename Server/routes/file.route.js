import express from "express";
import multer from "multer";
import { 
  uploadFile, 
  getUserFiles, 
  deleteFile, 
  getDashboardStats // ✅ Import this
} from "../controllers/file.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ Register the Stats Route (MUST be before /:id)
router.get("/stats", getDashboardStats);

router.post("/upload", upload.single("file"), uploadFile);
router.get("/my-files", getUserFiles); // Or "/" depending on your api.js
router.delete("/:id", deleteFile);

export default router;