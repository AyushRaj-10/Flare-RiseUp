import { ethers } from 'ethers'

const FLARE_RPC = import.meta.env.VITE_FLARE_RPC_URL || 'https://coston-api.flare.network/ext/C/rpc'
const DOCUMENT_REGISTRY_ADDRESS = import.meta.env.VITE_DOCUMENT_REGISTRY_ADDRESS

// Contract ABIs (simplified - in production, load from JSON files)
const DOCUMENT_REGISTRY_ABI = [
  'function mintDocument(address to, bytes32 docHash, string memory cid, bytes memory encryptedKey, string memory tokenURI) external returns (uint256)',
  'function getDocument(uint256 tokenId) external view returns (tuple(bytes32 docHash, string cid, bytes encryptedKey, address dao, bool collegeVerified, uint256 verifiedAt, bytes32 studentHash, string extraData))',
  'function getDocumentDAO(uint256 tokenId) external view returns (address)',
  'function isCollegeVerified(uint256 tokenId) external view returns (bool)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function balanceOf(address owner) external view returns (uint256)',
  'event DocumentMinted(uint256 indexed tokenId, address indexed owner, bytes32 indexed docHash, string cid, address dao)',
]

const DOCUMENT_DAO_ABI = [
  'function addCollaborator(address user, uint8 role) external',
  'function removeCollaborator(address user) external',
  'function assignRole(address user, uint8 role) external',
  'function canAccess(address user, string memory operation) external view returns (bool)',
  'function getRole(address user) external view returns (uint8)',
  'function requestCollegeVerification(bytes32 studentHash, string memory extraInfo) external',
  'event CollaboratorAdded(uint256 indexed documentId, address indexed owner, address indexed collaborator, uint256 collaboratorPassId, uint8 role)',
]

const COLLABORATOR_PASS_ABI = [
  'function balanceOf(address account, uint256 id) external view returns (uint256)',
  'function isCollaborator(address user, uint256 docId) external view returns (bool)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event CollaboratorPassMinted(address indexed user, uint256 indexed docId, uint256 amount)',
]

/**
 * Get contract instance
 */
export const getDocumentRegistry = (signer) => {
  if (!DOCUMENT_REGISTRY_ADDRESS) {
    throw new Error(
      'DocumentRegistry address not configured. ' +
      'Please add VITE_DOCUMENT_REGISTRY_ADDRESS to frontend/.env file. ' +
      'See CONTRACT_SETUP.md for instructions.'
    )
  }
  return new ethers.Contract(DOCUMENT_REGISTRY_ADDRESS, DOCUMENT_REGISTRY_ABI, signer)
}

export const getDocumentDAO = (daoAddress, signer) => {
  return new ethers.Contract(daoAddress, DOCUMENT_DAO_ABI, signer)
}

export const getCollaboratorPass = (passAddress, provider) => {
  return new ethers.Contract(passAddress, COLLABORATOR_PASS_ABI, provider)
}

/**
 * Mint a document NFT
 */
export const mintDocument = async (signer, docHash, cid, encryptedKey, tokenURI) => {
  const registry = getDocumentRegistry(signer)
  
  // Convert docHash to bytes32
  const docHashBytes32 = ethers.isHexString(docHash) ? docHash : `0x${docHash}`
  
  // Convert encryptedKey to bytes
  // encryptedKey can be: Uint8Array (bytes), hex string, or regular string
  let encryptedKeyBytes
  if (encryptedKey instanceof Uint8Array) {
    // Already bytes, pass directly (ethers.js v6 handles Uint8Array for bytes params)
    encryptedKeyBytes = encryptedKey
  } else if (Array.isArray(encryptedKey)) {
    // Array of numbers, convert to Uint8Array
    encryptedKeyBytes = new Uint8Array(encryptedKey)
  } else if (ethers.isHexString(encryptedKey)) {
    // Hex string, convert to bytes
    encryptedKeyBytes = ethers.getBytes(encryptedKey)
  } else if (typeof encryptedKey === 'string') {
    // Regular string, convert to UTF-8 bytes
    encryptedKeyBytes = ethers.toUtf8Bytes(encryptedKey)
  } else {
    // Fallback: try to convert to string first
    encryptedKeyBytes = ethers.toUtf8Bytes(String(encryptedKey))
  }

  const tx = await registry.mintDocument(
    await signer.getAddress(),
    docHashBytes32,
    cid,
    encryptedKeyBytes,
    tokenURI
  )

  const receipt = await tx.wait()
  
  // Parse event
  const mintEvent = receipt.logs.find(log => {
    try {
      const parsed = registry.interface.parseLog(log)
      return parsed && parsed.name === 'DocumentMinted'
    } catch {
      return false
    }
  })

  if (!mintEvent) {
    throw new Error('DocumentMinted event not found')
  }

  const parsed = registry.interface.parseLog(mintEvent)
  return {
    tokenId: Number(parsed.args.tokenId),
    daoAddress: parsed.args.dao,
    txHash: receipt.hash,
  }
}

/**
 * Get document info
 */
export const getDocument = async (provider, tokenId) => {
  const registry = getDocumentRegistry(provider)
  const docInfo = await registry.getDocument(tokenId)
  
  return {
    docHash: docInfo.docHash,
    cid: docInfo.cid,
    encryptedKey: docInfo.encryptedKey,
    dao: docInfo.dao,
    collegeVerified: docInfo.collegeVerified,
    verifiedAt: Number(docInfo.verifiedAt),
    studentHash: docInfo.studentHash,
    extraData: docInfo.extraData,
  }
}

/**
 * Get tokenId from transaction hash by parsing the transaction receipt
 * This is useful when minting succeeded but backend wasn't updated
 */
export const getTokenIdFromTx = async (provider, txHash) => {
  try {
    const receipt = await provider.getTransactionReceipt(txHash)
    if (!receipt) {
      throw new Error('Transaction receipt not found')
    }

    const DOCUMENT_REGISTRY_ADDRESS = import.meta.env.VITE_DOCUMENT_REGISTRY_ADDRESS
    if (!DOCUMENT_REGISTRY_ADDRESS) {
      throw new Error('DocumentRegistry address not configured')
    }

    const registry = getDocumentRegistry(provider)
    
    // Find DocumentMinted event in the receipt
    for (const log of receipt.logs) {
      try {
        const parsed = registry.interface.parseLog(log)
        if (parsed && parsed.name === 'DocumentMinted') {
          return {
            tokenId: Number(parsed.args.tokenId),
            daoAddress: parsed.args.dao,
            owner: parsed.args.owner,
            docHash: parsed.args.docHash,
            cid: parsed.args.cid,
          }
        }
      } catch {
        // Not the event we're looking for, continue
        continue
      }
    }
    
    throw new Error('DocumentMinted event not found in transaction')
  } catch (error) {
    console.error('Error getting tokenId from tx:', error)
    throw error
  }
}

/**
 * Add collaborator
 */
export const addCollaborator = async (signer, daoAddress, userAddress, role) => {
  const dao = getDocumentDAO(daoAddress, signer)
  const tx = await dao.addCollaborator(userAddress, role)
  return await tx.wait()
}

/**
 * Request college verification
 */
export const requestCollegeVerification = async (signer, daoAddress, studentHash, extraInfo) => {
  const dao = getDocumentDAO(daoAddress, signer)
  const studentHashBytes32 = ethers.isHexString(studentHash) 
    ? studentHash 
    : `0x${studentHash}`
  
  const tx = await dao.requestCollegeVerification(studentHashBytes32, extraInfo)
  return await tx.wait()
}

/**
 * Query events in chunks to avoid RPC "too many blocks" error
 * @param contract Contract instance
 * @param filter Event filter
 * @param fromBlock Starting block number
 * @param toBlock Ending block number
 * @param step Block range per chunk (default: 30 - RPC limit)
 * @returns Array of events
 */
async function queryEventsInChunks(contract, filter, fromBlock, toBlock, step = 30) {
  const events = []
  let start = fromBlock
  const totalBlocks = toBlock - fromBlock + 1
  const totalChunks = Math.ceil(totalBlocks / step)

  console.log(`  Querying ${totalBlocks} blocks in ${totalChunks} chunks of ${step} blocks each...`)

  while (start <= toBlock) {
    const end = Math.min(start + step - 1, toBlock)
    try {
      const chunkNum = Math.floor((start - fromBlock) / step) + 1
      console.log(`  [${chunkNum}/${totalChunks}] Querying blocks ${start} to ${end}...`)
      const chunkEvents = await contract.queryFilter(filter, start, end)
      events.push(...chunkEvents)
      if (chunkEvents.length > 0) {
        console.log(`    ✅ Found ${chunkEvents.length} events in this chunk`)
      }
    } catch (error) {
      console.error(`  ❌ Error querying blocks ${start}-${end}:`, error.message)
      // Try smaller chunk if error persists
      if (step > 10 && error.message.includes('too many blocks')) {
        console.log(`  ⚠️ Reducing chunk size and retrying...`)
        // Recursively try with smaller chunk
        const smallerStep = Math.floor(step / 2)
        const smallerEvents = await queryEventsInChunks(contract, filter, start, end, smallerStep)
        events.push(...smallerEvents)
      }
    }
    start = end + 1
    
    // Add small delay to avoid rate limiting
    if (start <= toBlock) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  console.log(`  ✅ Total events found: ${events.length}`)
  return events
}

/**
 * Get all document IDs where user is a collaborator by querying TransferSingle events
 * @param provider Ethers provider
 * @param userAddress User's wallet address
 * @returns Array of tokenIds where user has CollaboratorPass
 * @deprecated Use getSharedDocumentsFor instead which uses CollaboratorAdded event
 */
export const getCollaboratorDocuments = async (provider, userAddress) => {
  const COLLABORATOR_PASS_ADDRESS = import.meta.env.VITE_COLLABORATOR_PASS_ADDRESS
  if (!COLLABORATOR_PASS_ADDRESS) {
    console.warn('⚠️ CollaboratorPass address not configured')
    return []
  }

  try {
    const passContract = getCollaboratorPass(COLLABORATOR_PASS_ADDRESS, provider)
    
    // Query TransferSingle events where user received CollaboratorPass (to == userAddress)
    // ERC1155 TransferSingle event: TransferSingle(operator, from, to, id, value)
    const filter = passContract.filters.TransferSingle(null, null, userAddress, null, null)
    
    // Get events from last 10000 blocks (adjust as needed)
    const currentBlock = await provider.getBlockNumber()
    const fromBlock = Math.max(0, currentBlock - 10000)
    
    console.log(`🔍 Querying CollaboratorPass TransferSingle events from block ${fromBlock} to ${currentBlock}...`)
    const events = await queryEventsInChunks(passContract, filter, fromBlock, currentBlock)
    
    // Extract unique tokenIds (document IDs)
    const tokenIds = [...new Set(events.map(e => Number(e.args.id)))]
    console.log(`✅ Found ${tokenIds.length} CollaboratorPass NFTs for user ${userAddress.slice(0, 10)}...`)
    console.log(`   Token IDs:`, tokenIds)
    
    return tokenIds
  } catch (error) {
    console.error('❌ Error getting collaborator documents:', error)
    return []
  }
}

/**
 * Get shared documents for a user by querying CollaboratorAdded events from DocumentDAO contracts
 * @param provider Ethers provider
 * @param userAddress User's wallet address
 * @returns Array of shared document objects with metadata
 */
export const getSharedDocumentsFor = async (provider, userAddress) => {
  const DOCUMENT_REGISTRY_ADDRESS = import.meta.env.VITE_DOCUMENT_REGISTRY_ADDRESS
  if (!DOCUMENT_REGISTRY_ADDRESS) {
    console.warn('⚠️ DocumentRegistry address not configured')
    return []
  }

  try {
    console.log(`🔍 Getting shared documents for ${userAddress.slice(0, 10)}...`)
    
    // Get DocumentRegistry contract
    const registry = getDocumentRegistry(provider)
    
    // Get current block number
    const currentBlock = await provider.getBlockNumber()
    
    // Use a more recent block range to avoid querying too many blocks
    // Query last 2000 blocks (about 8 hours on Coston) to catch recent documents
    // This avoids the "too many blocks" RPC error
    const recentBlocks = 2000 // Query last 2000 blocks
    const fromBlock = Math.max(0, currentBlock - recentBlocks)
    
    console.log(`  Step 1: Getting all documents from DocumentMinted events`)
    console.log(`    Current block: ${currentBlock}`)
    console.log(`    Querying from block: ${fromBlock} (last ${recentBlocks} blocks)`)
    
    // Step 1: Get all documents by querying DocumentMinted events
    const mintFilter = registry.filters.DocumentMinted()
    const mintEvents = await queryEventsInChunks(registry, mintFilter, fromBlock, currentBlock, 30)
    
    console.log(`  Found ${mintEvents.length} documents`)
    
    if (mintEvents.length === 0) {
      console.log('  No documents found')
      return []
    }
    
    // Step 2: Check CollaboratorPass balance for each document
    // This is more reliable than querying events and works with both old and new contracts
    const COLLABORATOR_PASS_ADDRESS = import.meta.env.VITE_COLLABORATOR_PASS_ADDRESS
    if (!COLLABORATOR_PASS_ADDRESS) {
      console.warn('⚠️ CollaboratorPass address not configured, cannot check shared documents')
      return []
    }

    const passContract = getCollaboratorPass(COLLABORATOR_PASS_ADDRESS, provider)
    const sharedDocsMap = new Map()
    
    console.log(`  Step 2: Checking CollaboratorPass balance for ${mintEvents.length} documents...`)
    
    for (const mintEvent of mintEvents) {
      try {
        const parsed = registry.interface.parseLog(mintEvent)
        if (parsed && parsed.name === 'DocumentMinted') {
          const documentId = Number(parsed.args.tokenId)
          const daoAddress = parsed.args.dao
          const owner = parsed.args.owner
          
          // Skip documents owned by the user
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            continue
          }
          
          // Check if user has CollaboratorPass for this document
          const balance = await passContract.balanceOf(userAddress, documentId)
          
          if (balance > 0n) {
            console.log(`    ✅ Found CollaboratorPass for document ${documentId} (balance: ${balance})`)
            
            // Get document metadata
            const docInfo = await getDocument(provider, documentId)
            
            // Try to get role from DocumentDAO if available
            let role = 1 // Default to VIEWER
            try {
              const daoContract = new ethers.Contract(daoAddress, DOCUMENT_DAO_ABI, provider)
              const userRole = await daoContract.getRole(userAddress)
              role = Number(userRole)
            } catch (roleError) {
              console.warn(`    Could not get role for document ${documentId}:`, roleError.message)
            }
            
            sharedDocsMap.set(documentId.toString(), {
              tokenId: documentId,
              cid: docInfo.cid,
              docHash: docInfo.docHash,
              daoAddress: daoAddress,
              collegeVerified: docInfo.collegeVerified,
              verifiedAt: docInfo.verifiedAt,
              owner: owner,
              role: role,
              isShared: true,
              name: `Document #${documentId}`, // Will be enriched from backend if available
            })
          }
        }
      } catch (error) {
        console.warn(`  Error processing document from mint event:`, error.message)
        continue
      }
    }
    
    const sharedDocs = Array.from(sharedDocsMap.values())
    console.log(`✅ Returning ${sharedDocs.length} shared documents`)
    return sharedDocs
  } catch (error) {
    console.error('❌ Error getting shared documents:', error)
    return []
  }
}

/**
 * Fallback method: Check CollaboratorPass balance directly for each document
 * This is used when CollaboratorAdded events are not available (old contracts)
 */
async function getSharedDocumentsFallback(provider, userAddress, mintEvents) {
  const COLLABORATOR_PASS_ADDRESS = import.meta.env.VITE_COLLABORATOR_PASS_ADDRESS
  if (!COLLABORATOR_PASS_ADDRESS) {
    return []
  }

  try {
    const passContract = getCollaboratorPass(COLLABORATOR_PASS_ADDRESS, provider)
    const registry = getDocumentRegistry(provider)
    const sharedDocs = []

    for (const mintEvent of mintEvents) {
      try {
        const parsed = registry.interface.parseLog(mintEvent)
        if (parsed && parsed.name === 'DocumentMinted') {
          const documentId = Number(parsed.args.tokenId)
          
          // Check if user has CollaboratorPass for this document
          const balance = await passContract.balanceOf(userAddress, documentId)
          if (balance > 0n) {
            console.log(`    ✅ Found CollaboratorPass balance for document ${documentId}`)
            
            // Get document metadata
            const docInfo = await getDocument(provider, documentId)
            
            sharedDocs.push({
              tokenId: documentId,
              cid: docInfo.cid,
              docHash: docInfo.docHash,
              daoAddress: docInfo.dao || docInfo.daoAddress,
              collegeVerified: docInfo.collegeVerified,
              verifiedAt: docInfo.verifiedAt,
              owner: parsed.args.owner,
              isShared: true,
              name: `Document #${documentId}`,
            })
          }
        }
      } catch (error) {
        console.warn(`  Error in fallback for document:`, error.message)
        continue
      }
    }

    return sharedDocs
  } catch (error) {
    console.error('❌ Error in fallback method:', error)
    return []
  }
}

/**
 * Check if user has CollaboratorPass for a specific document
 * @param provider Ethers provider
 * @param userAddress User's wallet address
 * @param tokenId Document token ID
 * @returns true if user has access
 */
export const hasCollaboratorAccess = async (provider, userAddress, tokenId) => {
  const COLLABORATOR_PASS_ADDRESS = import.meta.env.VITE_COLLABORATOR_PASS_ADDRESS
  if (!COLLABORATOR_PASS_ADDRESS) {
    console.warn('⚠️ COLLABORATOR_PASS_ADDRESS not configured')
    return false
  }

  try {
    const passContract = getCollaboratorPass(COLLABORATOR_PASS_ADDRESS, provider)
    const balance = await passContract.balanceOf(userAddress, tokenId)
    const hasAccess = balance > 0n
    console.log(`  🔍 CollaboratorPass balance for user ${userAddress.slice(0, 10)}... on tokenId ${tokenId}: ${balance} (hasAccess: ${hasAccess})`)
    return hasAccess
  } catch (error) {
    console.error(`❌ Error checking collaborator access for tokenId ${tokenId}:`, error)
    return false
  }
}


