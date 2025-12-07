# Frontend Environment Setup

## Create `frontend/.env` file

Create a file named `.env` in the `frontend` directory with:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_FLARE_RPC_URL=https://coston-api.flare.network/ext/C/rpc
VITE_DOCUMENT_REGISTRY_ADDRESS=0x1673bA82aD3B1f45b0Ee37116ef919f9294712Aa
VITE_COLLABORATOR_PASS_ADDRESS=0x33e8Cc1D92999316D53d5d981E3CFD523Ab71134
```

## Quick Setup

**Windows PowerShell:**
```powershell
cd frontend
@"
VITE_BACKEND_URL=http://localhost:5000
VITE_FLARE_RPC_URL=https://coston-api.flare.network/ext/C/rpc
VITE_DOCUMENT_REGISTRY_ADDRESS=0x1673bA82aD3B1f45b0Ee37116ef919f9294712Aa
VITE_COLLABORATOR_PASS_ADDRESS=0x33e8Cc1D92999316D53d5d981E3CFD523Ab71134
"@ | Out-File -FilePath .env -Encoding utf8
```

**Mac/Linux:**
```bash
cd frontend
cat > .env << EOF
VITE_BACKEND_URL=http://localhost:5000
VITE_FLARE_RPC_URL=https://coston-api.flare.network/ext/C/rpc
VITE_DOCUMENT_REGISTRY_ADDRESS=0x1673bA82aD3B1f45b0Ee37116ef919f9294712Aa
VITE_COLLABORATOR_PASS_ADDRESS=0x33e8Cc1D92999316D53d5d981E3CFD523Ab71134
EOF
```

## After Creating .env

**Important:** Restart the frontend dev server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

Vite needs to restart to pick up new environment variables!


