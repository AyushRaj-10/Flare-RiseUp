import mongoose from "mongoose";

const accessRequestSchema = new mongoose.Schema({
  fileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'File', 
    required: true 
  },
  requester: { 
    type: String, 
    required: true 
  }, // Wallet Address of person asking for access
  owner: { 
    type: String, 
    required: true 
  }, // Wallet Address of file owner
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  requestDate: { 
    type: Date, 
    default: Date.now 
  },
  publicKey: { 
    type: String 
  } // For encrypted sharing (optional)
});

export const AccessRequest = mongoose.model("AccessRequest", accessRequestSchema);