// server/controllers/access.controller.js
import {AccessRequest} from "../models/access.model.js";
import { File } from "../models/file.model.js";

// Helper to get wallet from header
const getWallet = (req) => req.headers["x-wallet-owner"];

// 1. Request Access (Called by User B)
export const requestAccess = async (req, res) => {
    try {
        const requesterWallet = getWallet(req);
        const { fileId } = req.params;

        const file = await File.findById(fileId);
        if (!file) return res.status(404).json({ error: "File not found" });
        if (file.owner === requesterWallet) {
            return res.status(400).json({ error: "Cannot request access to your own file" });
        }

        const existingRequest = await AccessRequest.findOne({
            fileId, requesterWallet, status: 'PENDING'
        });
        if (existingRequest) {
            return res.status(409).json({ error: "Access request already pending" });
        }

        const newRequest = new AccessRequest({
            fileId,
            requesterWallet,
            ownerWallet: file.owner,
        });
        await newRequest.save();

        res.json({ success: true, message: "Request submitted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to submit request" });
    }
};

// 2. View Incoming Requests (Called by File Owner)
export const getIncomingRequests = async (req, res) => {
    try {
        const ownerWallet = getWallet(req);

        const requests = await AccessRequest.find({ ownerWallet })
            .populate('fileId', 'name cid') // Get file name and CID
            .sort({ requestedAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch incoming requests" });
    }
};

// 3. Approve/Reject Request (Called by File Owner)
export const handleAccessDecision = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision } = req.body; // "APPROVED" or "REJECTED"
        const ownerWallet = getWallet(req);

        const request = await AccessRequest.findOne({ _id: id, ownerWallet, status: 'PENDING' });
        if (!request) return res.status(404).json({ error: "Request not found or already processed" });

        // ⚠️ REAL IMPLEMENTATION: This is where you would call the Flare smart contract
        let txHash = `MOCK_TX_${decision}_${Date.now()}`;
        
        request.status = decision;
        request.approvalTxHash = txHash;
        await request.save();

        res.json({ 
            success: true, 
            message: `Request ${decision} successfully logged on-chain.`, 
            txHash,
            request 
        });
    } catch (err) {
        res.status(500).json({ error: `Failed to process decision: ${err.message}` });
    }
};