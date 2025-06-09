
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { mainnet, arbitrum, polygon } from 'wagmi/chains'

// Get projectId from https://cloud.walletconnect.com
export const projectId = 'YOUR_PROJECT_ID'

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Crypto Dashboard',
  description: 'A modern crypto trading dashboard',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [mainnet, arbitrum, polygon] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  // Optional - Override createConfig parameters
})
