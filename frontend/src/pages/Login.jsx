import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Wallet, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CyberBackground from '../components/ui/CyberBackground'; // Ensure path is correct

const Login = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState("wallet");
  const [isConnecting, setIsConnecting] = useState(false);

  // ----------------------------------------------------
  // 👇 UPDATED: SIMPLIFIED CONNECTION (NO SIGNATURE)
  // ----------------------------------------------------
  const handleWalletConnect = async () => {
    if (!window.ethereum) {
      return toast.error("Please install MetaMask!");
    }

    setIsConnecting(true);
    const toastId = toast.loading("Connecting to wallet...");

    try {
      // 1. Request Account Access directly from MetaMask
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });
      
      const walletAddress = accounts[0];

      // 2. Simulate "Login" by saving to LocalStorage
      // The API interceptor in api.js will read this for the 'x-wallet-owner' header
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('walletAddress', walletAddress);

      toast.success("Wallet Connected Successfully", { id: toastId });
      
      // 3. Redirect
      setTimeout(() => navigate("/dashboard"), 500);

    } catch (error) {
      console.error(error);
      toast.error("Connection Failed", { id: toastId });
    } finally {
      setIsConnecting(false);
    }
  };
  // ----------------------------------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black relative overflow-hidden text-white font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-20 pointer-events-none"></div>
      
      {/* Ensure CyberBackground handles its own errors if file missing */}
      <CyberBackground /> 
      
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-cyber-black via-cyber-black/80 to-transparent pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-cyber-dark border border-cyber-gray p-8 rounded-2xl shadow-[0_0_40px_rgba(0,255,157,0.1)] relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-cyber-gray/50 rounded-full flex items-center justify-center border border-cyber-green text-cyber-green shadow-[0_0_15px_rgba(0,255,157,0.3)]">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">
            DOC<span className="text-cyber-green">SENTINEL</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-mono">
            SECURE. DECENTRALIZED. VERIFIED.
          </p>
        </div>

        {/* Method Toggle */}
        <div className="flex bg-cyber-gray p-1 rounded-lg mb-8">
          <button
            onClick={() => setMethod("wallet")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              method === "wallet" ? "bg-cyber-dark text-cyber-green shadow-sm" : "text-gray-400 hover:text-white"
            }`}
          >
            <Wallet size={16} /> Web3 Wallet
          </button>
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all text-gray-600 cursor-not-allowed"
          >
            <Lock size={16} /> Email (Disabled)
          </button>
        </div>

        {/* Wallet Connect Button */}
        <div className="space-y-4">
            <div className="bg-cyber-gray/30 border border-cyber-gray p-4 rounded-lg text-xs text-gray-400 font-mono mb-4">
                <p>STATUS: <span className="text-cyber-green">ONLINE</span></p>
                <p>ENCRYPTION: <span className="text-cyber-blue">AES-256 ENABLED</span></p>
                <p>AUTH MODE: <span className="text-yellow-500">CLIENT-SIDE (DEMO)</span></p>
            </div>

            <button
                onClick={handleWalletConnect}
                disabled={isConnecting}
                className="w-full bg-cyber-green text-cyber-black font-bold py-3 rounded-lg hover:bg-[#00e08b] hover:shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isConnecting ? (
                <><Loader2 className="animate-spin" /> Connecting...</>
                ) : (
                <>Connect MetaMask <ArrowRight size={18} /></>
                )}
            </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 font-mono">
            SECURED BY DOCSENTINEL PROTOCOL V1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;