
import { useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, ChevronDown } from "lucide-react";

const Header = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();

  const networks = [
    { id: 1, name: "Ethereum", symbol: "ETH" },
    { id: 8453, name: "Base", symbol: "ETH" },
    { id: 59144, name: "Linea Testnet", symbol: "ETH" },
    { id: 11124, name: "Abstract Testnet", symbol: "ETH" },
    { id: 41454, name: "Monad Testnet", symbol: "MON" },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleNetworkChange = (chainId: string) => {
    switchChain({ chainId: parseInt(chainId) });
  };

  const getCurrentNetwork = () => {
    return networks.find(network => network.id === chain?.id);
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
            {/* Network Selector */}
            {isConnected && (
              <Select 
                value={chain?.id?.toString() || ""} 
                onValueChange={handleNetworkChange}
              >
                <SelectTrigger className="w-48 bg-muted/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <SelectValue placeholder="Select Network">
                      {getCurrentNetwork()?.name || "Unknown Network"}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {networks.map((network) => (
                    <SelectItem key={network.id} value={network.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{network.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
