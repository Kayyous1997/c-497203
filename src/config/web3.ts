
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, sepolia, baseGoerli, base, arbitrumGoerli, arbitrum, lineaTestnet } from 'wagmi/chains'

// Get projectId from https://cloud.walletconnect.com
export const projectId = '535acf9f46f8f279f492a746b1ec219a'

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Crypto Dashboard',
  description: 'A modern crypto trading dashboard',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Custom chain definitions for networks not in wagmi/chains
const abstractTestnet = {
  id: 11124,
  name: 'Abstract Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://api.testnet.abs.xyz'],
    },
    public: {
      http: ['https://api.testnet.abs.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Abstract Explorer', url: 'https://explorer.testnet.abs.xyz' },
  },
  testnet: true,
} as const

const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
    public: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
} as const

// Create wagmiConfig
const chains = [mainnet, sepolia, baseGoerli, base, arbitrumGoerli, arbitrum, lineaTestnet, abstractTestnet, monadTestnet] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  // Optional - Override createConfig parameters
})
