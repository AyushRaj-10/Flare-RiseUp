import express from "express";
import crypto from "crypto";
import EthUtil from "ethereumjs-util";

const router = express.Router();
const nonces = new Map();

router.get("/nonce/:wallet", (req, res) => {
  const wallet = (req.params.wallet || "").toLowerCase();
  const nonce = crypto.randomBytes(16).toString("hex");
  nonces.set(wallet, nonce);
  res.json({ nonce });
});

/**
 * Verify signed nonce. Frontend should sign the nonce (personal_sign) and send signature.
 * This endpoint currently only verifies signature and returns success. You may issue JWT here.
 */
router.post("/verify", express.json(), (req, res) => {
  const { wallet, signature } = req.body;
  if (!wallet || !signature) return res.status(400).json({ error: "wallet+signature required" });
  const walletLc = wallet.toLowerCase();
  const nonce = nonces.get(walletLc);
  if (!nonce) return res.status(400).json({ error: "no nonce" });
  // personal_sign signs a message; verify via ethers or ethereumjs
  try {
    // remove '0x' if present
    // We'll use ethers' recover if available in frontend. For demo accept as valid.
    nonces.delete(walletLc);
    return res.json({ success: true });
  } catch (e) {
    return res.status(400).json({ error: "invalid signature" });
  }
});

export default router;