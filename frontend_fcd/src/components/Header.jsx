import { useWeb3 } from '../context/Web3Context'
import { Shield, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'

const Header = () => {
  const { account, connectWallet, disconnectWallet, isConnected, chainId, switchToFlareNetwork } = useWeb3()

  const handleConnect = async () => {
    const connected = await connectWallet()
    if (connected && chainId !== 16) {
      // Not on Coston testnet, suggest switching
      toast('Please switch to Flare Coston Testnet', {
        icon: '⚠️',
        duration: 5000,
      })
    }
  }

  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rise Up</h1>
              <p className="text-sm text-gray-500">Web3 Document Security & Collaboration</p>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {chainId && chainId !== 16 && (
              <button
                onClick={switchToFlareNetwork}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
              >
                Switch to Flare Coston
              </button>
            )}

            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatAddress(account)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header



