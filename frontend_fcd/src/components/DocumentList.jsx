import { useState, useEffect } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { getDocument, mintDocument, getTokenIdFromTx } from '../services/blockchain'
import { File, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../services/api'
import { ethers } from 'ethers'

const DocumentList = ({ documents, onSelectDoc, selectedDoc, loading: externalLoading, onRefresh, title }) => {
  const { provider, account, signer } = useWeb3()
  const [localDocs, setLocalDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [enhancedDocs, setEnhancedDocs] = useState([])

  useEffect(() => {
    // Enhance documents with blockchain data if available
    const enhanceDocuments = async () => {
      if (documents.length === 0) {
        setEnhancedDocs(documents)
        return
      }

      // If no provider, just return documents as-is
      if (!provider) {
        setEnhancedDocs(documents)
        return
      }

      const enhanced = await Promise.all(
        documents.map(async (doc) => {
          // If document has tokenId, fetch blockchain data
          if (doc.tokenId) {
            try {
              const blockchainData = await getDocument(provider, doc.tokenId)
              return {
                ...doc,
                ...blockchainData,
                // Ensure daoAddress is set (from blockchain or backend)
                daoAddress: blockchainData.dao || doc.daoAddress || doc.dao,
                // Update verification status from blockchain (most up-to-date)
                collegeVerified: blockchainData.collegeVerified !== undefined 
                  ? blockchainData.collegeVerified 
                  : doc.collegeVerified,
                verifiedAt: blockchainData.verifiedAt || doc.verifiedAt,
              }
            } catch (error) {
              console.error(`Error loading doc ${doc.tokenId}:`, error)
              // Still return doc with existing daoAddress if available
              return {
                ...doc,
                daoAddress: doc.daoAddress || doc.dao,
              }
            }
          }
          
          // For documents without tokenId but with txHash, try to find the tokenId from blockchain
          // This handles cases where minting succeeded but backend wasn't updated
          if (!doc.tokenId && doc.txHash && doc.txHash !== 'pending' && provider) {
            try {
              console.log(`🔍 Auto-syncing document ${doc._id || doc.name} with txHash ${doc.txHash.slice(0, 10)}...`)
              const txData = await getTokenIdFromTx(provider, doc.txHash)
              if (txData && txData.tokenId) {
                console.log(`✅ Auto-sync found tokenId ${txData.tokenId} for document ${doc._id || doc.name}`)
                // Try to update backend with the found tokenId (but don't block on it)
                try {
                  await api.put('/api/file/update-nft', {
                    fileId: doc._id,
                    tokenId: txData.tokenId,
                    daoAddress: txData.daoAddress,
                    txHash: doc.txHash,
                  })
                  console.log(`✅ Backend updated with tokenId ${txData.tokenId}`)
                } catch (updateError) {
                  // Backend update failed, but that's OK - we have the tokenId from blockchain
                  console.warn(`⚠️ Could not update backend (NFT is on-chain, this is OK):`, updateError.message)
                }
                // Return doc with tokenId from blockchain - UI will update immediately
                return {
                  ...doc,
                  tokenId: txData.tokenId,
                  daoAddress: txData.daoAddress,
                }
              }
            } catch (error) {
              console.error(`Error auto-syncing blockchain for doc ${doc._id || doc.name}:`, error.message)
              // Continue with original doc if sync fails
            }
          }
          
          // If document has tokenId, it's already minted - show it
          if (doc.tokenId) {
            return doc
          }
          
          // For documents without tokenId, ensure daoAddress field exists
          return {
            ...doc,
            daoAddress: doc.daoAddress || doc.dao,
          }
        })
      )

      setEnhancedDocs(enhanced)
    }

    enhanceDocuments()
  }, [documents, provider])

  const handleSelect = (doc) => {
    if (onSelectDoc) {
      onSelectDoc(doc)
    }
  }

  // Check if document is stuck in minting (uploaded > 2 minutes ago without tokenId)
  const isStuckMinting = (doc) => {
    if (doc.tokenId) return false
    if (!doc.uploadedAt) return false
    const uploadTime = new Date(doc.uploadedAt).getTime()
    const now = Date.now()
    return (now - uploadTime) > 2 * 60 * 1000 // 2 minutes
  }

  const handleRetryMinting = async (doc, e) => {
    e.stopPropagation() // Don't select document when clicking retry
    
    if (!doc.cid || !doc.hash) {
      toast.error('Cannot retry: Missing IPFS CID or file hash. Please re-upload the document.')
      return
    }

    if (!signer) {
      toast.error('Please connect your wallet first')
      return
    }

    toast.loading('Retrying NFT minting...', { id: `retry-${doc._id}` })
    
    try {
      // We need to reconstruct the minting data
      // Note: We can't get the original AES key, so we'll use a placeholder
      // In production, you'd need to store the key securely or re-encrypt
      const docHash = doc.hash.startsWith('0x') ? doc.hash : `0x${doc.hash}`
      const docHashBytes32 = docHash.length === 66 ? docHash : `0x${doc.hash.padStart(64, '0')}`
      
      // For retry, we'll use a placeholder encrypted key
      // In a real scenario, you'd need to store this securely or re-encrypt
      // Note: This will be converted to bytes in mintDocument function
      const placeholderKey = 'retry-mint-placeholder'
      const tokenURI = `https://api.riseup.app/document/${doc._id}.json`

      if (!import.meta.env.VITE_DOCUMENT_REGISTRY_ADDRESS) {
        throw new Error('Smart contracts not configured')
      }

      const result = await mintDocument(
        signer,
        docHashBytes32,
        doc.cid,
        placeholderKey,
        tokenURI
      )

      // Update backend
      await api.put('/api/file/update-nft', {
        fileId: doc._id,
        tokenId: result.tokenId,
        daoAddress: result.daoAddress,
        txHash: result.txHash,
      })

      toast.success('✅ NFT minted successfully!', { id: `retry-${doc._id}` })
      
      // Trigger parent refresh if available
      if (onRefresh) {
        setTimeout(() => {
          onRefresh()
        }, 1000)
      } else {
        // Fallback to page reload
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error('Retry minting error:', error)
      toast.error(
        error.message || 'Failed to mint NFT. Please check console for details.',
        { id: `retry-${doc._id}`, duration: 5000 }
      )
    }
  }

  const displayDocs = enhancedDocs.length > 0 ? enhancedDocs : documents

  if (externalLoading || loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading documents...</p>
      </div>
    )
  }

  if (displayDocs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          {title === 'Documents Shared With Me' 
            ? 'No documents shared with you yet' 
            : 'No documents yet'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {title === 'Documents Shared With Me'
            ? 'Documents shared by others will appear here'
            : 'Upload your first document to get started'}
        </p>
      </div>
    )
  }

  // Content without wrapper (wrapper is handled by App.jsx when title is provided)
  const listContent = (
    <div className="space-y-3">
        {displayDocs.map((doc) => (
          <div
            key={doc.tokenId || doc._id}
            onClick={() => handleSelect(doc)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedDoc?.tokenId === doc.tokenId || selectedDoc?._id === doc._id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <File className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {doc.name || `Document #${doc.tokenId || 'N/A'}`}
                    </p>
                    {doc.isShared && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                        Shared
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 flex-wrap gap-2">
                    {doc.tokenId ? (
                      <>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          🎨 NFT #{doc.tokenId}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Minted
                        </span>
                      </>
                    ) : doc.txHash && doc.txHash !== 'pending' ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        Syncing...
                      </span>
                    ) : isStuckMinting(doc) ? (
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Minting Failed
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-spin" />
                        ⏳ Minting...
                      </span>
                    )}
                    {doc.cid && (
                      <span className="bg-gray-100 px-2 py-1 rounded truncate max-w-xs">
                        📦 IPFS: {doc.cid.slice(0, 10)}...
                      </span>
                    )}
                    {doc.daoAddress && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        🏛️ DAO
                      </span>
                    )}
                    {doc.uploadedAt && (
                      <span className="text-xs text-gray-400">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {doc.collegeVerified !== undefined && (
                    <div className="mt-2 flex items-center space-x-2">
                      {doc.collegeVerified ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">
                            Verified by college via FDC
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">Not verified</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {doc.txHash && doc.txHash !== 'pending' && (
                <a
                  href={`https://coston-explorer.flare.network/tx/${doc.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1 ml-2"
                  title="View on Flare Explorer"
                >
                  <span>View TX</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {!doc.tokenId && doc.txHash && doc.txHash !== 'pending' && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (!provider) {
                      toast.error('Please connect your wallet first')
                      return
                    }
                    toast.loading('Syncing with blockchain...', { id: `sync-${doc._id}` })
                    try {
                      const txData = await getTokenIdFromTx(provider, doc.txHash)
                      if (txData && txData.tokenId) {
                        console.log(`✅ Found tokenId ${txData.tokenId} from blockchain`)
                        // Update backend (but don't fail if it doesn't work)
                        try {
                          await api.put('/api/file/update-nft', {
                            fileId: doc._id,
                            tokenId: txData.tokenId,
                            daoAddress: txData.daoAddress,
                            txHash: doc.txHash,
                          })
                          console.log(`✅ Backend updated with tokenId ${txData.tokenId}`)
                        } catch (updateError) {
                          console.warn('⚠️ Could not update backend (this is OK, NFT is on-chain):', updateError.message)
                        }
                        toast.success(`✅ Found NFT #${txData.tokenId}!`, { id: `sync-${doc._id}`, duration: 3000 })
                        // Force immediate refresh
                        if (onRefresh) {
                          setTimeout(() => onRefresh(), 300)
                        }
                      } else {
                        toast.error('Could not find NFT in transaction', { id: `sync-${doc._id}` })
                      }
                    } catch (error) {
                      console.error('Sync error:', error)
                      toast.error(`Sync failed: ${error.message}`, { id: `sync-${doc._id}`, duration: 5000 })
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1 ml-2 px-2 py-1 rounded hover:bg-blue-50 transition-colors font-medium"
                  title="Sync with Blockchain - Click to fetch NFT ID from transaction"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync NFT</span>
                </button>
              )}
              {!doc.tokenId && isStuckMinting(doc) && !doc.txHash && (
                <button
                  onClick={(e) => handleRetryMinting(doc, e)}
                  className="text-orange-600 hover:text-orange-700 text-sm flex items-center space-x-1 ml-2 px-2 py-1 rounded hover:bg-orange-50 transition-colors"
                  title="Retry NFT Minting"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
              {doc.tokenId && (
                <a
                  href={`https://coston-explorer.flare.network/address/${import.meta.env.VITE_DOCUMENT_REGISTRY_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-green-600 hover:text-green-700 text-sm flex items-center space-x-1 ml-2"
                  title="View NFT Contract"
                >
                  <span>NFT</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
    </div>
  )

  // If title is provided, return content without wrapper (wrapper is in App.jsx)
  if (title) {
    return listContent
  }

  // Otherwise, return with wrapper for standalone use
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">My Documents</h2>
      {listContent}
    </div>
  )
}

export default DocumentList
