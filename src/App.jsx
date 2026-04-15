import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import WalletConnectProvider from '@walletconnect/web3-provider'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'

const TESTNET_CHAIN_ID = 11155111
const TESTNET_RPC = 'https://rpc.sepolia.org'
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'
const CONTRACT_ABI = [
  'function message() view returns (string)',
  'function setMessage(string _message)'
]

function App() {
  const [account, setAccount] = useState('')
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contractValue, setContractValue] = useState('---')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [walletName, setWalletName] = useState('')
  const [network, setNetwork] = useState('Sepolia')

  useEffect(() => {
    if (!provider) return
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        resetConnection()
      } else {
        setAccount(accounts[0])
      }
    }

    const handleChainChanged = () => {
      setNetwork('Sepolia')
    }

    if (provider.provider?.on) {
      provider.provider.on('accountsChanged', handleAccountsChanged)
      provider.provider.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (provider?.provider?.removeListener) {
        provider.provider.removeListener('accountsChanged', handleAccountsChanged)
        provider.provider.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [provider])

  const resetConnection = () => {
    setAccount('')
    setProvider(null)
    setSigner(null)
    setWalletName('')
    setContractValue('---')
    setStatus('')
    setError('')
  }

  const setEthersProvider = async (web3Provider, walletLabel) => {
    const ethersProvider = new ethers.BrowserProvider(web3Provider)
    const signer = await ethersProvider.getSigner()
    const address = await signer.getAddress()
    const networkData = await ethersProvider.getNetwork()

    setProvider(ethersProvider)
    setSigner(signer)
    setAccount(address)
    setNetwork(networkData.name || 'Sepolia')
    setWalletName(walletLabel)
    setStatus(`Connected with ${walletLabel}`)
    setError('')

    await readContractData(ethersProvider)
  }

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask topilmadi. Iltimos, MetaMask o‘rnating.')
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      await setEthersProvider(window.ethereum, 'MetaMask')
    } catch (err) {
      setError(err.message)
      setStatus('MetaMask bilan ulanishda xato')
    }
  }

  const connectWalletConnect = async () => {
    try {
      const walletConnectProvider = new WalletConnectProvider({
        rpc: {
          [TESTNET_CHAIN_ID]: TESTNET_RPC
        },
        qrcode: true
      })
      await walletConnectProvider.enable()
      await setEthersProvider(walletConnectProvider, 'WalletConnect')
    } catch (err) {
      setError(err.message)
      setStatus('WalletConnect bilan ulanishda xato')
    }
  }

  const connectCoinbaseWallet = async () => {
    try {
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'Davronbekova DApp',
        jsonRpcUrl: TESTNET_RPC
      })
      const coinbaseProvider = coinbaseWallet.makeWeb3Provider(TESTNET_RPC, TESTNET_CHAIN_ID)
      await coinbaseProvider.request({ method: 'eth_requestAccounts' })
      await setEthersProvider(coinbaseProvider, 'Coinbase Wallet')
    } catch (err) {
      setError(err.message)
      setStatus('Coinbase Wallet bilan ulanishda xato')
    }
  }

  const readContractData = async (providerOrSigner) => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner)
      const message = await contract.message()
      setContractValue(message || 'Kontrakt ma’lumot topilmadi')
      setError('')
    } catch (err) {
      setContractValue('Kontrakt ma’lumotini o‘qib bo‘lmadi')
      setError('Kontraktga ulanish xatosi: ' + err.message)
    }
  }

  const sendContractData = async (event) => {
    event.preventDefault()
    if (!signer) {
      setError('Avvalo hamyonni ulang.')
      return
    }
    if (!inputValue.trim()) {
      setError('Iltimos, inputni to‘ldiring.')
      return
    }

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const tx = await contract.setMessage(inputValue)
      setStatus('pending')
      setError('')
      await tx.wait()
      setStatus('success')
      setInputValue('')
      await readContractData(signer)
    } catch (err) {
      setStatus('error')
      setError('Tranzaksiya xatosi: ' + err.message)
    }
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Davronbekova DApp</h1>
        <p>MetaMask, WalletConnect va Coinbase Wallet orqali Sepolia testnet-da ishlaydi.</p>
      </header>

      <section className="cards">
        <div className="card">
          <h2>1. Wallet ga ulanish</h2>
          <button onClick={connectMetaMask}>Connect MetaMask</button>
          <button onClick={connectWalletConnect}>Connect WalletConnect</button>
          <button onClick={connectCoinbaseWallet}>Connect Coinbase Wallet</button>
        </div>

        <div className="card">
          <h2>2. Hisob ma’lumotlari</h2>
          <p><strong>Wallet:</strong> {walletName || 'Ulanmagan'}</p>
          <p><strong>Account:</strong> {account || '---'}</p>
          <p><strong>Network:</strong> {network || 'Sepolia'}</p>
        </div>

        <div className="card">
          <h2>3. Kontrakt ma’lumotlari</h2>
          <p>{contractValue}</p>
        </div>
      </section>

      <section className="form-card">
        <h2>4. Kontraktga ma’lumot yuborish</h2>
        <form onSubmit={sendContractData}>
          <label>
            Yangi xabar:
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Masalan: Salom, Davronbekova!"
            />
          </label>
          <button type="submit">Yuborish</button>
        </form>
      </section>

      <section className="status-card">
        <h2>5. Tranzaksiya holati</h2>
        <p><strong>Status:</strong> {status || 'Kutilmoqda'}</p>
        {error && <p className="error">Xato: {error}</p>}
      </section>

      <footer>
        <small>Kontrakt adresini `src/App.jsx` ichida o‘zgartiring va Sepolia testnet RPC bilan ishlang.</small>
      </footer>
    </div>
  )
}

export default App
