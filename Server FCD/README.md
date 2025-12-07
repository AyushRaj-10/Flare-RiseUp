# Rise Up Backend

Web3 Document Security & Collaboration Backend Server

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_connection_string
     PINATA_API_KEY=your_pinata_api_key
     PINATA_SECRET_API_KEY=your_pinata_secret_api_key
     NODE_ENV=development
     ```

3. **Start Server**
   ```bash
   npm start
   ```

## API Endpoints

- `GET /test` - Test server connection
- `GET /api/file/documents?owner=<wallet_address>` - Get documents for a user
- `POST /api/file/upload` - Upload encrypted file to IPFS
- `PUT /api/file/update-nft` - Update file with NFT information

## Requirements

- Node.js 18+
- MongoDB (local or Atlas)
- Pinata account for IPFS storage
