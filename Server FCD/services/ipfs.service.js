import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export const uploadToIPFS = async (filePath) => {
  try {
    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      throw new Error("Pinata API keys are not configured. Please add PINATA_API_KEY and PINATA_SECRET_API_KEY to .env file");
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    console.log("📤 Uploading file to Pinata IPFS...");

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    const cid = res.data.IpfsHash;
    console.log("✅ File uploaded to IPFS. CID:", cid);
    return cid;
  } catch (err) {
    console.error("❌ IPFS upload failed:", err.response?.data || err.message);
    throw new Error(`IPFS upload failed: ${err.response?.data?.error || err.message}`);
  }
};
