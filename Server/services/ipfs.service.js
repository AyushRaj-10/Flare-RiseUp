import axios from "axios";
import fs from "fs";
import FormData from "form-data";

export const uploadToIPFS = async (filePath) => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      }
    );

    return res.data.IpfsHash;
  } catch (err) {
    console.error("❌ IPFS upload failed:", err.response?.data || err.message);
    throw new Error("Pinata upload failed");
  }
};
