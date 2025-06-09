
import React from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet } from 'lucide-react'

export function WalletConnect() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <Card className="bg-secondary/20 border-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">
                {formatAddress(address)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
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
