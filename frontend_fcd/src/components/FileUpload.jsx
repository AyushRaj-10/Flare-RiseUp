import { useState } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '../context/Web3Context'
import { uploadFile, api } from '../services/api'
import { encryptFile, hashFile, generateAESKey } from '../services/encryption'
import { mintDocument } from '../services/blockchain'
import { Upload, File as FileIcon, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const FileUpload = ({ onUpload }) => {
  const { signer, isConnected, account } = useWeb3()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, JPG, or PNG file')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Step 1: Generate AES key and encrypt file
      toast.loading('Encrypting file...', { id: 'upload' })
      const aesKey = generateAESKey()
      const { encrypted, iv } = await encryptFile(file, aesKey)

      // Step 2: Hash encrypted file
      const docHash = await hashFile(encrypted)
      toast.loading('Uploading to IPFS...', { id: 'upload' })

      // Step 3: Upload encrypted file to backend (which uploads to IPFS)
      const encryptedFile = new File([encrypted], file.name + '.enc', {
        type: 'application/octet-stream',
      })

      const uploadResponse = await uploadFile(
        encryptedFile, 
        (percent) => {
          setProgress(percent)
        },
        account // Send owner address
      )

      const { cid, hash, file: fileDoc } = uploadResponse.data

      // Step 4: Wrap AES key (in production, use user's public key)
      // For now, we'll store it as hex (in production, encrypt with user's public key)
      const wrappedKey = ethers.toUtf8Bytes(aesKey + '|' + iv)

      // Step 5: Mint document NFT on Flare blockchain
      // Check if contracts are configured
      if (!import.meta.env.VITE_DOCUMENT_REGISTRY_ADDRESS) {
        throw new Error(
          'Smart contracts not configured. ' +
          'Please add contract addresses to frontend/.env. ' +
          'See CONTRACT_SETUP.md for setup instructions.'
        )
      }

      toast.loading('Minting NFT on Flare blockchain...', { id: 'upload' })
      console.log('🔗 Minting NFT on Flare Coston Testnet...')
      console.log('   Contract:', import.meta.env.VITE_DOCUMENT_REGISTRY_ADDRESS)
      console.log('   Doc Hash:', '0x' + docHash)
      console.log('   IPFS CID:', cid)
      console.log('   Wallet:', account)

      const tokenURI = `https://api.riseup.app/document/${Date.now()}.json`
      
      let result
      try {
        result = await mintDocument(
          signer,
          '0x' + docHash,
          cid,
          wrappedKey,
          tokenURI
        )
      } catch (mintError) {
        console.error('❌ NFT Minting failed:', mintError)
        // Update backend to mark as failed (optional - you could add a status field)
        throw new Error(
          `NFT minting failed: ${mintError.message || 'Unknown error'}. ` +
          `Please check your wallet connection and try again.`
        )
      }

      console.log('✅ NFT Minted on Flare!', {
        tokenId: result.tokenId,
        daoAddress: result.daoAddress,
        txHash: result.txHash,
        explorer: `https://coston-explorer.flare.network/tx/${result.txHash}`
      })

      // Step 6: Update backend with NFT information (non-blocking)
      // We update the UI immediately with blockchain data, backend update is optional
      const updatedFileDoc = {
        ...fileDoc,
        tokenId: result.tokenId,
        daoAddress: result.daoAddress,
        txHash: result.txHash,
      }

      // Try to update backend, but don't wait for it or fail if it doesn't work
      const updateBackend = async () => {
        try {
          const fileId = fileDoc?._id || fileDoc?.id
          if (fileId) {
            const fileIdStr = fileId.toString ? fileId.toString() : String(fileId)
            console.log('📤 Updating backend with NFT info:', {
              fileId: fileIdStr,
              tokenId: result.tokenId,
              daoAddress: result.daoAddress,
              txHash: result.txHash,
            })
            await api.put('/api/file/update-nft', {
              fileId: fileIdStr,
              tokenId: result.tokenId,
              daoAddress: result.daoAddress,
              txHash: result.txHash,
            })
            console.log('✅ NFT info saved to backend')
          }
        } catch (updateError) {
          console.warn('⚠️ Backend update failed (NFT is on-chain, this is OK):', updateError.message)
          // Don't show error to user - NFT is successfully minted on-chain
        }
      }
      
      // Update backend in background (non-blocking)
      updateBackend()

      toast.success(`✅ Document NFT #${result.tokenId} minted on Flare!`, { 
        id: 'upload',
        duration: 5000 
      })

      // Reset form
      setFile(null)
      setProgress(0)

      // Immediately notify parent with NFT data - UI updates right away
      if (onUpload) {
        onUpload({
          ...updatedFileDoc,
          _refresh: true,
          _justMinted: true, // Flag to indicate this was just minted
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      
      // Better error messages
      let errorMessage = 'Upload failed'
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`
        console.error('Server error:', error.response.data)
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to backend server. Please check if the server is running on ' + (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
        console.error('Network error - no response from server:', error.request)
      } else {
        // Something else happened
        errorMessage = error.message || 'Upload failed'
        console.error('Error:', error.message)
      }
      
      toast.error(errorMessage, { id: 'upload', duration: 5000 })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Document</h2>

      {/* File Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <FileIcon className="w-8 h-8 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-600 mb-2">
                Drag and drop your file here, or click to select
              </p>
              <label className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors">
                Select File
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, JPG, PNG (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Uploading...</span>
            <span className="text-sm font-medium text-gray-900">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {file && !uploading && (
        <button
          onClick={handleUpload}
          disabled={!isConnected}
          className="mt-4 w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {uploading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload & Mint Document</span>
            </>
          )}
        </button>
      )}

      {!isConnected && (
        <p className="mt-4 text-sm text-center text-gray-500">
          Connect your wallet to upload documents
        </p>
      )}
    </div>
  )
}

export default FileUpload

