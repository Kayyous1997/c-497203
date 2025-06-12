
import React from 'react'
import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet, Copy, ExternalLink, LogOut } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'

export function WalletConnect() {
  const { open } = useWeb3Modal()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()
  
  const { data: balance } = useBalance({
    address: address,
  })

  console.log('WalletConnect - isConnected:', isConnected, 'address:', address)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = (balance: any) => {
    if (!balance) return '0.00'
    return parseFloat(balance.formatted).toFixed(4)
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const openExplorer = () => {
    if (address && chain) {
      const explorerUrl = chain.blockExplorers?.default?.url
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${address}`, '_blank')
      }
    }
  }

  const handleDisconnect = () => {
    console.log('Disconnecting wallet...')
    disconnect()
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const handleManageWallet = () => {
    console.log('Opening wallet management...')
    open({ view: 'Account' })
  }

  if (isConnected && address) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="bg-secondary/20 border-muted/20 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">
                {formatAddress(address)}
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Connected Wallet</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Address</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono">{formatAddress(address)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="text-sm">{chain?.name || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="text-sm font-medium">
                  {formatBalance(balance)} {balance?.symbol || 'ETH'}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className="flex-1"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openExplorer}
                className="flex-1"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Explorer
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleManageWallet}
                className="flex-1"
              >
                Manage Wallet
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Button
      onClick={() => open()}
      className="w-full flex items-center space-x-2"
      variant="outline"
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </Button>
  )
}
