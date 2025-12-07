import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// File upload with FormData
export const uploadFile = async (file, onProgress, ownerAddress = null) => {
  const formData = new FormData()
  formData.append('file', file)
  if (ownerAddress) {
    formData.append('owner', ownerAddress)
  }

  try {
    return await api.post('/api/file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for large files
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      },
    })
  } catch (error) {
    // Log detailed error info
    console.error('Upload API error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      baseURL: API_URL,
    })
    throw error
  }
}

// Auth endpoints
export const getNonce = async (wallet) => {
  return api.get(`/api/auth/nonce/${wallet}`)
}

export const verifySignature = async (wallet, signature) => {
  return api.post('/api/auth/verify', { wallet, signature })
}

// Test endpoint
export const testBackend = async () => {
  return api.get('/test')
}

// Update file with NFT information
export const updateFileWithNFT = async (fileId, tokenId, daoAddress, txHash) => {
  return api.put('/api/file/update-nft', {
    fileId,
    tokenId,
    daoAddress,
    txHash,
  })
}


