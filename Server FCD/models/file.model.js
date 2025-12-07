import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cid: { type: String, required: true }, // IPFS CID
  hash: { type: String, required: true }, // Encrypted file hash
  owner: { type: String, required: true }, // Wallet address
  txHash: { type: String, default: "pending" }, // Blockchain transaction hash
  tokenId: { type: Number }, // NFT token ID (from DocumentRegistry)
  daoAddress: { type: String }, // DocumentDAO address
  collegeVerified: { type: Boolean, default: false }, // FDC verification status
  uploadedAt: { type: Date, default: Date.now },
});

const File = mongoose.model("File", fileSchema);

// Helper to save file metadata
export const saveFileMetadata = async (data) => {
  const file = new File(data);
  return await file.save();
};

export { File };
