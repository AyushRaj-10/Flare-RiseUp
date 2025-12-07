import { useState, useEffect } from 'react'
import { Web3Provider, useWeb3 } from './context/Web3Context'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import DocumentList from './components/DocumentList'
import CollaborationPanel from './components/CollaborationPanel'
import { api } from './services/api'
import { hasCollaboratorAccess } from './services/blockchain'

function AppContent() {
  const { account, provider } = useWeb3()
  const [documents, setDocuments] = useState([])
  const [sharedDocuments, setSharedDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sharedLoading, setSharedLoading] = useState(false) // Separate loading state for shared docs
  const [sharedError, setSharedError] = useState(null) // Error state for shared docs
  const [activeTab, setActiveTab] = useState('my-docs') // 'my-docs' or 'shared'

  useEffect(() => {
    // Test backend connection
    const testConnection = async () => {
      try {
        const response = await api.get('/test')
        console.log('✅ Backend connected:', response.data)
      } catch (err) {
        console.error('❌ Backend connection failed:', err)
        if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
          console.error('⚠️ Make sure backend server is running on', import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000')
        }
      }
    }
    testConnection()
  }, [])

  useEffect(() => {
    if (account) {
      loadDocuments()
      // Also load shared documents when account changes
      if (activeTab === 'shared') {
        loadSharedDocuments()
      }
    }
  }, [account])

  // Load shared documents when switching to "Shared With Me" tab
  useEffect(() => {
    if (account && provider && activeTab === 'shared') {
      loadSharedDocuments()
    }
  }, [activeTab, account, provider])

  const handleDocumentUploaded = (uploadData) => {
    // If this was just minted, update documents immediately with the NFT data
    if (uploadData && uploadData._justMinted && uploadData.tokenId) {
      console.log('🎉 Document just minted! Updating UI with tokenId:', uploadData.tokenId)
      // Immediately update the documents list with the new NFT data
      setDocuments(prevDocs => {
        // Find and update the document that was just minted
        const updated = prevDocs.map(doc => {
          // Match by fileId, cid, or hash
          if (doc._id === uploadData._id || 
              doc.cid === uploadData.cid || 
              doc.hash === uploadData.hash) {
            return {
              ...doc,
              tokenId: uploadData.tokenId,
              daoAddress: uploadData.daoAddress,
              txHash: uploadData.txHash,
            }
          }
          return doc
        })
        // If document not found, add it
        if (!updated.find(d => d._id === uploadData._id)) {
          updated.unshift(uploadData)
        }
        return updated
      })
      // Don't refresh from backend immediately - the UI is already updated
      // The auto-sync in DocumentList will handle finding tokenId from blockchain
      // Only refresh after a longer delay to let backend catch up (if it's working)
      setTimeout(() => {
        loadDocuments()
      }, 2000)
    } else {
      // Normal refresh
      loadDocuments()
    }
  }

  const loadDocuments = async () => {
    if (!account) return
    
    setLoading(true)
    try {
      // Load owned documents
      const response = await api.get('/api/file/documents', {
        params: { owner: account },
      })
      const backendDocs = response.data.documents || []
      
      // Merge with existing documents to preserve tokenId from blockchain
      setDocuments(prevDocs => {
        // Create a map of existing docs by _id, cid, or hash
        const existingMap = new Map()
        prevDocs.forEach(doc => {
          if (doc._id) existingMap.set(`id_${doc._id}`, doc)
          if (doc.cid) existingMap.set(`cid_${doc.cid}`, doc)
          if (doc.hash) existingMap.set(`hash_${doc.hash}`, doc)
        })
        
        // Merge backend docs with existing docs (preserve tokenId from blockchain)
        return backendDocs.map(backendDoc => {
          const existing = existingMap.get(`id_${backendDoc._id}`) || 
                          existingMap.get(`cid_${backendDoc.cid}`) || 
                          existingMap.get(`hash_${backendDoc.hash}`)
          
          // If we have existing doc with tokenId but backend doesn't, preserve it
          if (existing && existing.tokenId && !backendDoc.tokenId) {
            return {
              ...backendDoc,
              tokenId: existing.tokenId,
              daoAddress: existing.daoAddress || backendDoc.daoAddress,
              txHash: existing.txHash || backendDoc.txHash,
            }
          }
          
          return backendDoc
        })
      })
      
      // Load shared documents (documents where user is a collaborator)
      await loadSharedDocuments()
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSharedDocuments = async () => {
    if (!account || !provider) {
      console.log('⚠️ Cannot load shared documents: missing account or provider')
      return
    }
    
    setSharedLoading(true)
    setSharedError(null)
    
    try {
      console.log('🔍 Loading shared documents for:', account)
      
      // Use new getSharedDocumentsFor function that queries CollaboratorAdded events
      const { getSharedDocumentsFor } = await import('./services/blockchain')
      const sharedDocs = await getSharedDocumentsFor(provider, account)
      
      console.log(`📋 Found ${sharedDocs.length} shared documents from CollaboratorAdded events`)
      
      if (sharedDocs.length === 0) {
        console.log('ℹ️ No shared documents found. User may not be a collaborator on any documents.')
        setSharedDocuments([])
        return
      }
      
      // Enrich with backend data if available (for document names, etc.)
      const enriched = []
      
      for (const doc of sharedDocs) {
        try {
          // Try to get document metadata from backend (optional - for name, etc.)
          let backendDoc = null
          try {
            const response = await api.get('/api/file/documents')
            const allDocs = response.data.documents || []
            backendDoc = allDocs.find(d => d.tokenId === doc.tokenId)
          } catch (err) {
            console.warn(`  Could not fetch backend data for tokenId ${doc.tokenId}:`, err.message)
          }
          
          // Combine blockchain data with backend data (if available)
          const enrichedDoc = {
            ...doc,
            // Use backend data if available, otherwise use blockchain data
            name: backendDoc?.name || doc.name || `Document #${doc.tokenId}`,
            owner: backendDoc?.owner || doc.owner || 'Unknown',
            uploadedAt: backendDoc?.uploadedAt || new Date(),
            _id: backendDoc?._id, // Backend ID if available
          }
          
          enriched.push(enrichedDoc)
          console.log(`  ✅ Added shared document ${doc.tokenId}: ${enrichedDoc.name}`)
        } catch (error) {
          console.error(`  ❌ Error enriching document ${doc.tokenId}:`, error.message)
          // Still add it with existing data
          enriched.push(doc)
        }
      }
      
      console.log(`✅ Found ${enriched.length} shared documents:`, enriched.map(d => ({ tokenId: d.tokenId, name: d.name })))
      setSharedDocuments(enriched)
    } catch (error) {
      console.error('❌ Error loading shared documents:', error)
      setSharedError(error.message || 'Failed to load shared documents')
      setSharedDocuments([])
    } finally {
      setSharedLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Documents */}
          <div className="lg:col-span-2 space-y-6">
            <FileUpload onUpload={handleDocumentUploaded} />
            
            {/* Tabs for My Documents and Shared Documents */}
            <div className="bg-white rounded-lg shadow-md">
              {/* Tab Headers */}
              <div className="flex space-x-4 border-b border-gray-200 px-6 pt-4">
                <button
                  onClick={() => setActiveTab('my-docs')}
                  className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === 'my-docs'
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  My Documents ({documents.length})
                  {activeTab === 'my-docs' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('shared')}
                  className={`px-4 py-3 font-medium text-sm transition-colors relative ${
                    activeTab === 'shared'
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Shared With Me ({sharedDocuments.length})
                  {activeTab === 'shared' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"></span>
                  )}
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'my-docs' ? (
                  <DocumentList 
                    documents={documents}
                    onSelectDoc={setSelectedDoc}
                    selectedDoc={selectedDoc}
                    loading={loading}
                    onRefresh={loadDocuments}
                  />
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">Documents Shared With Me</h2>
                      <button
                        onClick={loadSharedDocuments}
                        disabled={sharedLoading}
                        className="px-3 py-1.5 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                        title="Refresh shared documents"
                      >
                        <svg className={`w-4 h-4 ${sharedLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{sharedLoading ? 'Loading...' : 'Refresh'}</span>
                      </button>
                    </div>
                    {sharedError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">Error: {sharedError}</p>
                      </div>
                    )}
                    <DocumentList 
                      documents={sharedDocuments}
                      onSelectDoc={setSelectedDoc}
                      selectedDoc={selectedDoc}
                      loading={sharedLoading}
                      onRefresh={loadSharedDocuments}
                      title="Documents Shared With Me"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Collaboration Panel */}
          <div className="lg:col-span-1">
            {selectedDoc ? (
              <CollaborationPanel document={selectedDoc} />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Select a document to manage collaboration
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  )
}

export default App

