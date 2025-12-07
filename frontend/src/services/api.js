import axios from 'axios';
import { ethers } from 'ethers';

// Ensure this matches your backend port (usually 5000 or 8000)
const API_URL = 'http://localhost:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor to attach wallet address to requests
api.interceptors.request.use((config) => {
  const wallet = localStorage.getItem('walletAddress');
  if (wallet) {
    config.headers['x-wallet-owner'] = wallet;
  }
  return config;
});

export const AuthService = {
  login: async (walletAddress) => {
    try {
      // 1. Get Nonce from Backend
      const nonceRes = await api.get(`/auth/nonce/${walletAddress}`);
      const { nonce } = nonceRes.data;

      if (!window.ethereum) throw new Error("No crypto wallet found");

      // 2. Sign the Nonce using MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonce);

      // 3. Send Signature to Backend for Verification
      const verifyRes = await api.post('/auth/verify', { 
        wallet: walletAddress, 
        signature 
      });

      if (verifyRes.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('walletAddress', walletAddress);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Auth Logic Error:", error);
      throw error;
    }
  }
};

export const FileService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/file/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getMyFiles: async () => {
    return api.get('/file/my-files'); // Ensure route exists in backend
  },
  
  deleteFile: async (fileId) => {
    return api.delete(`/file/${fileId}`);
  },

  // ✅ UPDATED: Use 'api.get' to respect baseURL (fixes 404 error)
  getStats: () => {
    return api.get('/file/stats'); 
  }
};

export const AIService = {
  // 1. Initialize RAG (Decrypts file on server -> sends to Python)
  initChat: (fileId) => api.post('/ai/init', { fileId }),

  // 2. Chat with document
  chatWithDocument: (message) => api.post('/ai/chat', { message })
};

export const AccessService = {
  requestAccess: async (fileId, message) => {
    return api.post(`/access/request/${fileId}`, { message });
  },

  getIncomingRequests: async () => {
    return api.get("/access/incoming");
  },

  handleDecision: async (requestId, decision) => {
    // decision should be "APPROVED" or "REJECTED"
    return api.post(`/access/decision/${requestId}`, { decision });
  }
};

export default api;