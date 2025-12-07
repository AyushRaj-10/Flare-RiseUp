import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cid: { type: String, required: true },
  hash: { type: String, required: true },
  owner: { type: String, required: true },
  // ✅ ADDED THESE TWO FIELDS:
  path: { type: String, required: true }, 
  txHash: { type: String, required: false, unique: true }, 
  uploadedAt: { type: Date, default: Date.now },
});

const File = mongoose.model("File", fileSchema);

export const saveFileMetadata = async (data) => {
  const file = new File(data);
  return await file.save();
};

export { File };