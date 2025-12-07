// server/routes/access.route.js
import express from "express";
import { 
    requestAccess, 
    getIncomingRequests, 
    handleAccessDecision 
} from "../controllers/access.controller.js"; // ✅ CORRECT PATH

const router = express.Router();

router.post("/request/:fileId", express.json(), requestAccess);
router.get("/incoming", getIncomingRequests);
router.post("/decision/:id", express.json(), handleAccessDecision);

export default router;