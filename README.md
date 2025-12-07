# 🚀 Flare-RiseUp: Decentralized DigiLocker + Collaborative Editing Platform

> **Powered by Flare Network • IPFS • Smart Contracts • On-Chain Access Control • AI Document Security**

A secure, verifiable, decentralized document vault that works like a blockchain-native version of Google Drive + DigiLocker + Collaborative Editing. Built with true Web3 fundamentals, ensuring zero trust, tamper-proof documents, and cryptographic collaboration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Flare Network](https://img.shields.io/badge/Flare-Network-orange)
![IPFS](https://img.shields.io/badge/IPFS-Enabled-green)
![Smart Contracts](https://img.shields.io/badge/Smart-Contracts-purple)

---

## 🔥 Problem We Solve

Centralized systems (Google Drive, Dropbox, college portals) suffer from critical security and trust issues:

- ❌ Admins can read or modify files without user consent
- ❌ No cryptographic guarantee of authenticity
- ❌ No on-chain trace of access or permissions
- ❌ Collaboration depends on centralized servers
- ❌ Sensitive government/academic documents can't be verified

**We fix all of this using true Web3 fundamentals.**

---

## 🛠️ Our Blockchain-Native Solution

### Core Features

- ✅ **Decentralized Storage (IPFS)** - All files stored in IPFS, not centralized servers
- ✅ **Smart Contract Access Control** - Each file linked to a FileRecord NFT-like entry on Flare blockchain
- ✅ **Wallet-Based Identity (MetaMask)** - Login = wallet signature, not email/password
- ✅ **On-Chain "Shared with Me"** - Collaborators see files by reading blockchain events
- ✅ **Zero Server Trust** - Server never sees plaintext or encryption keys

### FileRecord Structure

Each file is represented as a smart contract entry containing:
- Owner address
- Collaborator addresses
- IPFS CID
- Encrypted key
- File hash (SHA-256)

---

## 🔐 Cryptographic Storage Pipeline

Our security-grade storage process ensures complete privacy and integrity:

```
Step 1: User Uploads File (Browser Only)
    ↓
Step 2: Client-Side AES-256-GCM Encryption
    ↓
Step 3: AES Key Wrapping (Encrypted with User's Wallet Public Key)
    ↓
Step 4: File Stored on IPFS (Encrypted Bytes Only)
    ↓
Step 5: Smart Contract Stores:
    • IPFS CID
    • SHA-256 File Hash
    • Encrypted Key
    • Owner Wallet
    • Permission List
```

**Key Security Guarantees:**
- 🔒 Server cannot read or decrypt anything
- 🔒 Blockchain is the single source of truth for all permissions
- 🔒 Encryption keys never leave user's control

---

## 🔗 Flare Technologies Integration

Our system deeply integrates three major Flare Network components:

### 4.1 FDC — Flare Data Connector
**Full Form:** Flare Data Connector

- Verifies college ID / institution metadata
- Anchors document attributes through trusted attestors
- Creates verifiable external claims

### 4.2 FTSO — Flare Time Series Oracle
**Full Form:** Flare Time Series Oracle

- Provides verified timestamps
- Ensures trustless off-chain inputs
- Maintains consistent global time during document attestation

### 4.3 FSP — Flare Service Provider
**Full Form:** Flare Service Provider

- Enables secure metadata validation
- Queries trusted providers without trusting backend
- Provides decentralized API-style query execution

---

## 📁 Blockchain-Based Collaborative Editing

We replicate Google Drive's sharing model — but fully decentralized.

### Owner Actions
- ✅ Upload a file
- ✅ Add collaborators by wallet address
- ✅ Update permissions
- ✅ Manage access control

### Collaborator Actions
- ✅ See shared files (read from blockchain events)
- ✅ Download encrypted file
- ✅ Decrypt using wallet private key
- ✅ Edit, verify, review documents
- ⚠️ *Current MVP supports read-only access for collaborators*

### Why This Is Web3-Native?
- 🌐 No backend decides access
- 🌐 All collaboration is permissioned by smart contracts
- 🌐 All events are immutable and publicly auditable

---

## 🧠 AI Security Layer (Add-On Modules)

AI enhances the system but blockchain remains the backbone.

### 6.1 Document Deepfake Detector (ViT-Based)
- **Architecture:** Vision Transformer (ViT-B/16 backbone)
- **Model:** 2-neuron classification head
- **Training:** 18k real vs AI-generated documents
- **Purpose:** Detects fake marksheets, certificates, IDs
- **Interface:** Streamlit-based demo integrated

### 6.2 Image Tampering Detector (CNN Heatmaps)
- **Architecture:** Custom CNN
- **Training:** 6k tampered vs real images
- **Output:** Heatmap regions that were modified
- **Use Case:** Signature, stamp, face manipulation detection

### 6.3 RAG-Based PDF Summarizer & Q/A Chatbot
- Extracts embeddings from PDF
- Enables natural language Q/A
- Runs locally or server-side after user decrypts locally

**Note:** All AI operates outside blockchain but within trustless architecture.

---

## 🧩 Complete Architecture Overview

```
User Browser
    │
    ├── AES-256-GCM Encrypt File
    ├── Wrap Key with Wallet Public Key
    │
    ▼
IPFS (Encrypted Storage)
    │
    ▼
Flare Smart Contract
    │   ├── CID
    │   ├── File Hash
    │   ├── Encrypted Key
    │   ├── Owner Address
    │   └── Collaborators
    │
    ▼
Collaboration Dashboard (Frontend)
    │
    ▼
AI Modules (Optional, After Decryption)
```

---

## 🎯 Why This Is "Hardcore Blockchain"

Unlike typical AI + file upload projects, this system is blockchain at its core:

| Feature | Traditional Systems | Flare-RiseUp |
|---------|-------------------|--------------|
| **Storage** | Centralized servers | IPFS (Decentralized) |
| **Access Control** | Backend database | Smart contracts |
| **Identity** | Email/Password | Blockchain wallets |
| **Audit Logs** | Mutable database | Immutable blockchain |
| **Encryption Keys** | Server-managed | Client-controlled |
| **Verification** | Centralized APIs | FDC + FSP (Decentralized) |
| **Time Stamps** | Server clock | FTSO (Oracle-backed) |

**This is a true trustless, decentralized collaborative document system.**

---

## 📦 Project Structure

```
Flare-RiseUp/
├── frontend/          # React/Next.js frontend application
├── Server/            # Backend server (minimal trust)
├── Server FCD/        # Flare Data Connector integration
├── AI/                # AI security modules
│   ├── deepfake_detector/
│   ├── tampering_detector/
│   └── rag_summarizer/
└── contracts/         # Flare smart contracts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MetaMask or compatible Web3 wallet
- Flare Network RPC endpoint
- IPFS node (or use public gateway)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AyushRaj-10/Flare-RiseUp.git
   cd Flare-RiseUp
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Server Dependencies**
   ```bash
   cd ../Server
   npm install
   ```

4. **Install AI Module Dependencies**
   ```bash
   cd ../AI
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables**
   ```bash
   # Create .env files in respective directories
   # Add Flare RPC endpoint, IPFS gateway, etc.
   ```

6. **Deploy Smart Contracts**
   ```bash
   # Deploy to Flare Network testnet/mainnet
   # Update contract addresses in config
   ```

### Running the Application

1. **Start IPFS Node** (or use public gateway)
   ```bash
   ipfs daemon
   ```

2. **Start Backend Server**
   ```bash
   cd Server
   npm start
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Start AI Modules** (Optional)
   ```bash
   cd AI
   streamlit run deepfake_detector/app.py
   ```

---

## 🔒 Security Features

- **Client-Side Encryption:** AES-256-GCM encryption before upload
- **Key Management:** Wallet-based key wrapping
- **On-Chain Permissions:** Smart contract enforced access control
- **Immutable Audit Trail:** All actions recorded on blockchain
- **Zero-Knowledge Architecture:** Server never sees plaintext
- **Tamper Detection:** AI-powered document verification

---

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run smart contract tests
cd contracts
npm test

# Run AI module tests
cd AI
pytest
```

---

## 🛣️ Roadmap

- [ ] On-chain micro-DAO for each document
- [ ] Proposals for editing permissions
- [ ] Zero-knowledge proofs for encrypted file validation
- [ ] Real-time decentralized document editing
- [ ] NFT-based collaborator passes
- [ ] Full decentralized identity (DID) integration
- [ ] Mobile app (React Native)
- [ ] Multi-chain support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **AyushRaj-10** - Project Maintainer

---

## 🙏 Acknowledgments

- Flare Network for providing the blockchain infrastructure
- IPFS for decentralized storage
- The open-source community for amazing tools and libraries

---

## 📞 Contact & Support

- **GitHub Issues:** [Open an issue](https://github.com/AyushRaj-10/Flare-RiseUp/issues)
- **Discussions:** [GitHub Discussions](https://github.com/AyushRaj-10/Flare-RiseUp/discussions)

---

## ⚠️ Disclaimer

This project is in active development. Use at your own risk. Always audit smart contracts before deploying to mainnet.

---

**Built with ❤️ on Flare Network**

*Decentralizing document storage, one block at a time.*

