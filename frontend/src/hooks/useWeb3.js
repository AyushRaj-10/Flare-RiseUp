import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

export const useWeb3 = () => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);

    // 1. Check if MetaMask is installed
    if (!window.ethereum) {
      toast.error("MetaMask is not installed!", {
        duration: 4000,
        position: 'top-center',
      });
      
      // Delay slightly so the user sees the error, then redirect
      setTimeout(() => {
        toast("Redirecting to MetaMask download...", { icon: '🔗' });
        window.open("https://metamask.io/download/", "_blank");
      }, 1500);

      setIsConnecting(false);
      return null; // Stop the login process
    }

    try {
      // 2. Real Connection Logic
      let provider;
      try {
          provider = new ethers.BrowserProvider(window.ethereum);
      } catch (e) {
          provider = new ethers.providers.Web3Provider(window.ethereum);
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        const userAccount = accounts[0];
        setAccount(userAccount);
        localStorage.setItem('walletAddress', userAccount);
        toast.success("Wallet Connected Successfully");
        return userAccount;
      } else {
        toast.error("No accounts found");
        return null;
      }

    } catch (err) {
      console.error("Connection Error:", err);
      // Handle "User Rejected Request" specifically
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
         toast.error("You rejected the connection.");
      } else {
         toast.error("Connection Failed. Please try again.");
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

  return { account, connectWallet, isConnecting };
};