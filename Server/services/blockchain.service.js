import { ethers } from "ethers";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// ✅ Connect to Flare RPC
const provider = new ethers.JsonRpcProvider(process.env.FLARE_RPC_URL);

// ✅ Create wallet
const wallet = new ethers.Wallet(process.env.FLARE_PRIVATE_KEY, provider);

// ✅ Load Smart Contract
const abi = JSON.parse(fs.readFileSync("./services/FileStorageABI.json", "utf-8"));
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

/**
 * storeFileHashOnFlare
 * Reads a file, hashes it, and stores hash on Flare blockchain
 * @param {string} filePath - Path to encrypted file
 * @returns {Promise<string>} - Flare transaction hash
 */
export const storeFileHashOnFlare = async (filePath) => {
  try {
    // ✅ 1. Read file
    const fileBuffer = fs.readFileSync(filePath);

    // ✅ 2. Hash file using SHA256
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    // ✅ 3. Convert hash to bytes32 (exactly 32 bytes)
    const hashBytes32 = "0x" + hash;

    // ✅ 4. Send transaction to Flare
    const tx = await contract.storeHash(hashBytes32);
    console.log("✅ Transaction sent, waiting for mining...");

    // ✅ 5. Wait for transaction to be mined
    const receipt = await tx.wait();

    // ✅ 6. Always return REAL tx hash
    const txHash = receipt.hash;

    console.log("✅ Transaction mined:", txHash);

    return txHash;

  } catch (err) {

    // ✅ ✅ CLEAN DUPLICATE HANDLING (DO NOT RETURN FAKE TX HASH)
    if (
      err?.reason === "File already stored" ||
      err?.message?.includes("already stored")
    ) {
      console.warn("⚠ Blockchain duplicate detected.");
      throw new Error("DUPLICATE_ON_CHAIN");
    }

    console.error("❌ Error storing file hash on Flare:", err);
    throw new Error("FLARE_TX_FAILED");
  }
};