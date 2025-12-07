# Rise Up Frontend

Modern React frontend for the Rise Up Web3 document security & collaboration platform.

## Features

- 🔐 Web3 wallet connection (MetaMask)
- 📤 File upload with client-side encryption
- 📄 Document listing and management
- 👥 Collaboration management (add/remove collaborators)
- ✅ College verification via FDC
- 🎨 Modern, responsive UI with Tailwind CSS

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension

### Installation

```bash
cd frontend
npm install
```

### Configuration

Create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_FLARE_RPC_URL=https://coston-api.flare.network/ext/C/rpc
VITE_DOCUMENT_REGISTRY_ADDRESS=your_contract_address
VITE_COLLABORATOR_PASS_ADDRESS=your_contract_address
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Switch Network**: If not on Flare Coston, click "Switch to Flare Coston"
3. **Upload Document**: 
   - Drag & drop or select a file (PDF, JPG, PNG)
   - File is encrypted client-side
   - Uploaded to IPFS via backend
   - Document NFT is minted on Flare
4. **Manage Collaboration**:
   - Select a document
   - Add collaborators with roles (VIEWER, EDITOR, VERIFIER)
5. **Request Verification**:
   - Fill in student information
   - Request college verification via FDC

## Architecture

- **Web3Context**: Manages wallet connection and Web3 state
- **API Service**: Backend API calls
- **Encryption Service**: Client-side file encryption (AES-256)
- **Blockchain Service**: Smart contract interactions
- **Components**: 
  - Header: Wallet connection
  - FileUpload: Document upload with encryption
  - DocumentList: Display user's documents
  - CollaborationPanel: Manage collaborators and verification

## Tech Stack

- React 18
- Vite
- ethers.js v6
- Tailwind CSS
- react-hot-toast
- lucide-react (icons)

## Notes

- Files are encrypted client-side before upload
- AES keys are wrapped (in production, use user's public key)
- All blockchain interactions require wallet connection
- Supports Flare Coston testnet (chainId: 16)



