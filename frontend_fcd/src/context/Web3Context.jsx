import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

const Web3Context = createContext()

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider')
  }
  return context
}

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if wallet is already connected
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      
      checkConnection()
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          await connectWallet()
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error)
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!')
      return false
    }

    setIsConnecting(true)
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      // Get provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      const web3Signer = await web3Provider.getSigner()
      const network = await web3Provider.getNetwork()

      setAccount(accounts[0])
      setProvider(web3Provider)
      setSigner(web3Signer)
      setChainId(Number(network.chainId))

      toast.success('Wallet connected!')
      return true
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    toast.success('Wallet disconnected')
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      setAccount(accounts[0])
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(Number(chainId))
    window.location.reload()
  }

  const switchToFlareNetwork = async () => {
    if (!window.ethereum) return

    try {
      // Try to switch to Flare Coston testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x10' }], // Coston testnet
      })
    } catch (switchError) {
      // If chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x10',
                chainName: 'Flare Coston Testnet',
                nativeCurrency: {
                  name: 'Coston',
                  symbol: 'CFLR',
                  decimals: 18,
                },
                rpcUrls: ['https://coston-api.flare.network/ext/C/rpc'],
                blockExplorerUrls: ['https://coston-explorer.flare.network'],
              },
            ],
          })
        } catch (addError) {
          console.error('Error adding network:', addError)
          toast.error('Failed to add Flare network')
        }
      }
    }
  }

  const signMessage = async (message) => {
    if (!signer) {
      throw new Error('Wallet not connected')
    }
    return await signer.signMessage(message)
  }

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToFlareNetwork,
    signMessage,
    isConnected: !!account,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}



