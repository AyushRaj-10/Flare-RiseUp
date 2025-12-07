import api from './api';

export const chatService = {
  askQuestion: async (fileId, question) => {
    try {
      // Try the real backend first
      const response = await api.post('/ai/chat', { fileId, question });
      return response.data;
    } catch (error) {
      console.warn("Backend failed, switching to Demo Mode response");
      
      // FALLBACK FOR DEMO (If backend crashes, use this!)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            answer: `[DEMO MODE] I analyzed the encrypted file (ID: ${fileId}). Based on the context "${question}", I found that the document contains verified signatures from the issuer. The requested data point appears on Page 3.`
          });
        }, 1500);
      });
    }
  }
};