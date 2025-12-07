# What Happens After Your Document is Minted? 🎉

## ✅ Once Your Document Shows "✓ Minted" Status

After your document NFT is successfully minted on Flare blockchain, here's what you can do:

### 1. **View Your NFT** 🎨
- Click the "NFT" link next to your document to view it on Flare Explorer
- Your document now has a unique Token ID (e.g., NFT #5)
- The NFT is permanently stored on the Flare blockchain

### 2. **Manage Collaboration** 👥
- **Select your document** from the list
- The **Collaboration Panel** will appear on the right side
- You can now:
  - **Add Collaborators**: Grant access to other users with different roles:
    - **VIEWER**: Can view the document
    - **EDITOR**: Can view and edit
    - **VERIFIER**: Can verify document authenticity
    - **OWNER**: Full control (you)
  - Each collaborator receives a **CollaboratorPass NFT** (ERC1155)

### 3. **Request College Verification** 🎓
- If this is a certificate or ID document, you can request verification:
  - Enter student information (Name, Roll No, Date of Birth)
  - The system uses **Flare Data Connector (FDC)** to verify against college databases
  - Once verified, your document shows a green checkmark: "✓ Verified by college via FDC"

### 4. **Document Security** 🔐
- Your document is:
  - **Encrypted** with AES-256-GCM encryption
  - **Stored on IPFS** (decentralized storage)
  - **Metadata on-chain** (hash, CID, encrypted key)
  - **Access controlled** by the DocumentDAO

### 5. **Transfer Ownership** (Future Feature)
- As an NFT, you can transfer ownership to another wallet
- The new owner becomes the document owner

## 🔧 Current Status

Your document is **minted and on-chain**! The UI will automatically update to show:
- ✅ Green "✓ Minted" badge
- 🎨 NFT #X badge
- 🏛️ DAO badge (if DAO is deployed)
- 🔗 Transaction link to view on Flare Explorer

## ⚠️ If You See "Syncing..." Status

If your document shows "Syncing..." instead of "Minted":
1. Click the **"Sync NFT"** button
2. The system will fetch the Token ID from the blockchain
3. The UI will update automatically

## 🚀 Next Steps

1. **Select your minted document** to open the Collaboration Panel
2. **Add collaborators** if you want to share access
3. **Request verification** if this is a certificate/ID document
4. **View on Flare Explorer** to see your NFT on-chain

---

**Note**: The backend update (saving tokenId to database) is optional. Your NFT is already on-chain and secure, even if the backend update fails.


