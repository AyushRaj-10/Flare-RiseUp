import { useState } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { addCollaborator, requestCollegeVerification } from '../services/blockchain'
import { Users, UserPlus, Shield, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = {
  0: { name: 'NONE', color: 'gray' },
  1: { name: 'VIEWER', color: 'blue' },
  2: { name: 'EDITOR', color: 'green' },
  3: { name: 'VERIFIER', color: 'purple' },
  4: { name: 'OWNER', color: 'red' },
}

const CollaborationPanel = ({ document }) => {
  const { signer, account } = useWeb3()
  const [collaboratorAddress, setCollaboratorAddress] = useState('')
  const [selectedRole, setSelectedRole] = useState(1) // VIEWER
  const [loading, setLoading] = useState(false)
  const [verificationData, setVerificationData] = useState({
    studentName: '',
    rollNo: '',
    dob: '',
    extraInfo: '',
  })

  const handleAddCollaborator = async () => {
    // Get DAO address from document (could be dao or daoAddress)
    const daoAddress = document?.dao || document?.daoAddress

    if (!collaboratorAddress) {
      toast.error('Please enter a valid wallet address')
      return
    }

    // Validate address format
    if (!collaboratorAddress.startsWith('0x') || collaboratorAddress.length !== 42) {
      toast.error('Please enter a valid Ethereum address (0x...)')
      return
    }

    if (!daoAddress) {
      toast.error('Document does not have a DAO yet. Please wait for NFT to be minted.')
      return
    }

    if (!signer) {
      toast.error('Please connect your wallet')
      return
    }

    setLoading(true)
    try {
      await addCollaborator(signer, daoAddress, collaboratorAddress, selectedRole)
      toast.success('Collaborator added successfully!')
      setCollaboratorAddress('')
    } catch (error) {
      console.error('Error adding collaborator:', error)
      toast.error(error.message || 'Failed to add collaborator')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestVerification = async () => {
    // Get DAO address from document (could be dao or daoAddress)
    const daoAddress = document?.dao || document?.daoAddress

    if (!daoAddress) {
      toast.error('Document does not have a DAO yet. Please wait for NFT to be minted.')
      return
    }

    if (!signer) {
      toast.error('Please connect your wallet')
      return
    }

    const { studentName, rollNo, dob, extraInfo } = verificationData
    if (!studentName || !rollNo || !dob) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Create student hash (name + rollNo + DOB)
      const studentData = `${studentName}|${rollNo}|${dob}`
      const { ethers } = await import('ethers')
      const studentHash = ethers.id(studentData)

      await requestCollegeVerification(signer, daoAddress, studentHash, extraInfo)
      toast.success('Verification request submitted!')
      setVerificationData({
        studentName: '',
        rollNo: '',
        dob: '',
        extraInfo: '',
      })
    } catch (error) {
      console.error('Error requesting verification:', error)
      toast.error(error.message || 'Failed to request verification')
    } finally {
      setLoading(false)
    }
  }

  if (!document) {
    return null
  }

  // Get DAO address (could be dao or daoAddress from different sources)
  const daoAddress = document?.dao || document?.daoAddress

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Collaboration</h2>
      </div>

      {/* Add Collaborator */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Add Collaborator</h3>
        {!daoAddress && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
            <p className="text-sm text-yellow-800">
              ⚠️ This document doesn't have a DAO yet. The NFT must be minted first.
            </p>
            {document.tokenId && (
              <p className="text-xs text-yellow-600 mt-1">
                Token ID: {document.tokenId} - DAO should be available. Try refreshing.
              </p>
            )}
          </div>
        )}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Wallet address (0x...)"
            value={collaboratorAddress}
            onChange={(e) => setCollaboratorAddress(e.target.value.trim())}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={1}>VIEWER - Can view document</option>
            <option value={2}>EDITOR - Can edit document</option>
            <option value={3}>VERIFIER - Can verify document</option>
          </select>
          <button
            onClick={handleAddCollaborator}
            disabled={loading || !collaboratorAddress || !daoAddress}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Add Collaborator</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        {/* College Verification */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-medium text-gray-700">College Verification</h3>
          </div>

          {document.collegeVerified ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✅ Verified by college via FDC
              </p>
              {document.verifiedAt && (
                <p className="text-xs text-green-600 mt-1">
                  Verified on: {new Date(document.verifiedAt * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Student Name"
                value={verificationData.studentName}
                onChange={(e) =>
                  setVerificationData({ ...verificationData, studentName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <input
                type="text"
                placeholder="Roll Number"
                value={verificationData.rollNo}
                onChange={(e) =>
                  setVerificationData({ ...verificationData, rollNo: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={verificationData.dob}
                onChange={(e) =>
                  setVerificationData({ ...verificationData, dob: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <textarea
                placeholder="Additional Information (optional)"
                value={verificationData.extraInfo}
                onChange={(e) =>
                  setVerificationData({ ...verificationData, extraInfo: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleRequestVerification}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Requesting...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Request Verification</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Verification Status */}
      {document.collegeVerified !== undefined && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Verification Status</h3>
          {document.collegeVerified ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">✓ Verified by College</span>
              </div>
              <p className="text-xs text-green-700">
                This document has been verified via Flare Data Connector (FDC)
              </p>
              {document.verifiedAt && (
                <p className="text-xs text-green-600 mt-1">
                  Verified on: {new Date(document.verifiedAt * 1000).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">⏳ Verification Pending</span>
              </div>
              <p className="text-xs text-yellow-700">
                Verification request submitted. Waiting for FDC attestor to process...
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                The FDC attestor will verify against college databases and update the status.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Document Info */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Document Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Token ID:</span>
            <span className="text-gray-900 font-mono">{document.tokenId || 'N/A'}</span>
          </div>
          {daoAddress && (
            <div className="flex justify-between">
              <span className="text-gray-500">DAO Address:</span>
              <span className="text-gray-900 font-mono text-xs truncate max-w-xs">
                {daoAddress}
              </span>
            </div>
          )}
          {!daoAddress && document.tokenId && (
            <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
              ⚠️ DAO address not loaded. Fetching from blockchain...
            </div>
          )}
          {document.cid && (
            <div className="flex justify-between">
              <span className="text-gray-500">IPFS CID:</span>
              <span className="text-gray-900 font-mono text-xs truncate max-w-xs">
                {document.cid}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CollaborationPanel


