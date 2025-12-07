import { ethers } from "ethers";
import fs from "fs";

const provider = new ethers.providers.JsonRpcProvider(process.env.FLARE_RPC_URL);
const wallet = new ethers.Wallet(process.env.FLARE_PRIVATE_KEY, provider);

const fAssetAbi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount)",
];

const fAsset = new ethers.Contract(process.env.FASSET_ADDRESS, fAssetAbi, wallet);

export const getFAssetBalance = async (address) => {
  return await fAsset.balanceOf(address);
};

export const sendFAsset = async (to, amount) => {
  const tx = await fAsset.transfer(to, amount);
  await tx.wait();
  return tx.hash;
};
