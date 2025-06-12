
import { useState } from "react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ChevronDown, Globe } from "lucide-react";

const Header = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected, chain } = useAccount();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const openNetworkModal = () => {
    open({ view: 'Networks' });
  };

  return (
    <header className="w-full bg-background/80 backdrop-blur-sm border-b border-muted/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Crypto Dashboard</h1>
          </div>

          {/* Right side - Network selector and wallet */}
          <div className="flex items-center space-x-4">
            {/* Network Selector using AppKit */}
            {isConnected && (
              <Button
                variant="outline"
                onClick={openNetworkModal}
                className="flex items-center space-x-2 bg-muted/20"
              >
                <Globe className="h-4 w-4" />
                <span>{chain?.name || "Unknown Network"}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            )}

            {/* Wallet Connection */}
            {isConnected && address ? (
              <Card className="bg-secondary/20 border-muted/20">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formatAddress(address)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => open()}
                      className="p-1 h-auto"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                onClick={() => open()}
                className="flex items-center space-x-2"
                variant="outline"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
