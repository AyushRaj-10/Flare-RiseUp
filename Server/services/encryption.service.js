import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
const iv = Buffer.from(process.env.ENCRYPTION_IV, "hex");

export const encryptFile = (filePath) => {
  const data = fs.readFileSync(filePath);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const encryptedPath = filePath + ".enc";
  fs.writeFileSync(encryptedPath, encrypted);
  return encryptedPath;
};

export const decryptFile = (filePath) => {
  const data = fs.readFileSync(filePath);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  const decryptedPath = filePath.replace(".enc", ".dec");
  fs.writeFileSync(decryptedPath, decrypted);
  return decryptedPath;
};
