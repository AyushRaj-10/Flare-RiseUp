# What Happens After Adding a Collaborator? 👥

## ✅ When You Add a Collaborator

When you successfully add a collaborator to your document:

### 1. **CollaboratorPass NFT is Minted** 🎫
- The collaborator receives a **CollaboratorPass NFT** (ERC1155) on Flare blockchain
- This NFT proves they have access to your document
- The pass is **non-transferable** - only the DocumentDAO can manage it

### 2. **Role-Based Access** 🔐
The collaborator gets the role you assigned:
- **VIEWER (1)**: Can view the document
- **EDITOR (2)**: Can view and edit the document
- **VERIFIER (3)**: Can verify document authenticity
- **OWNER (4)**: Full control (usually just you)

### 3. **On-Chain Transaction** ⛓️
- The transaction is recorded on Flare blockchain
- You can view it on Flare Explorer
- The collaborator's access is permanent until you remove them

## 👀 How the Collaborator Sees It

### For the Collaborator:

1. **Connect Their Wallet**
   - The collaborator needs to connect the wallet address you added
   - They should use the same address you specified when adding them

2. **View Shared Documents**
   - They'll see a new tab: **"Shared With Me"** in the document list
   - All documents shared with them will appear there
   - Documents will show a **"Shared"** badge

3. **Access the Document**
   - They can click on any shared document to view it
   - They can see document details (Token ID, DAO address, IPFS CID)
   - Their access level depends on the role you assigned

4. **What They Can Do**
   - **VIEWER**: Can view document metadata and IPFS link
   - **EDITOR**: Can view and potentially edit (if edit functionality is implemented)
   - **VERIFIER**: Can verify document authenticity
   - **OWNER**: Full control (rarely given to collaborators)

## 🔄 Current Status

After adding a collaborator:
- ✅ Transaction is confirmed on Flare blockchain
- ✅ CollaboratorPass NFT is minted to their address
- ✅ They can now see the document in "Shared With Me" tab
- ✅ Access is controlled by the DocumentDAO on-chain

## 📝 Next Steps for Collaborator

1. **Tell the Collaborator**:
   - Share the document name/description
   - Let them know their wallet address was added
   - They should connect that wallet to see the document

2. **Collaborator Should**:
   - Open the Rise Up app
   - Connect their wallet (the address you added)
   - Go to "Shared With Me" tab
   - Click on the document to view details

## ⚠️ Important Notes

- **Wallet Address Must Match**: The collaborator must use the exact wallet address you added
- **Non-Transferable**: CollaboratorPass NFTs cannot be transferred - access is tied to the wallet
- **On-Chain Only**: Access is verified on-chain, not stored in backend database
- **Permanent Until Removed**: Access remains until you remove the collaborator via the DAO

## 🗑️ Removing a Collaborator

To remove a collaborator:
1. Select the document
2. Use the Collaboration Panel (future feature)
3. Remove their access via the DocumentDAO
4. Their CollaboratorPass NFT will be burned

---

**The collaborator can now access your document!** 🎉


