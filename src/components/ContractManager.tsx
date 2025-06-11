
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { useContractManager } from '@/hooks/useContractManager';
import { useDex } from '@/hooks/useUniswap';
import { useToast } from '@/hooks/use-toast';

const ContractManager = () => {
  const { toast } = useToast();
  const { contractsDeployed, dexConfig, currentChainId } = useDex();
  const { isDeploying, updateContractAddresses, validateContractDeployment } = useContractManager();
  
  const [routerAddress, setRouterAddress] = useState('');
  const [factoryAddress, setFactoryAddress] = useState('');

  const handleUpdateContracts = async () => {
    const success = await updateContractAddresses(routerAddress, factoryAddress);
    if (success) {
      // Optionally validate after update
      await validateContractDeployment(routerAddress, factoryAddress);
      setRouterAddress('');
      setFactoryAddress('');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getExplorerUrl = (address: string) => {
    const explorers = {
      1: 'https://etherscan.io/address/',
      8453: 'https://basescan.org/address/',
      59144: 'https://lineascan.build/address/'
    };
    
    const baseUrl = explorers[currentChainId as keyof typeof explorers];
    return baseUrl ? `${baseUrl}${address}` : null;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {contractsDeployed ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          Contract Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {contractsDeployed ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">✅ Contracts Deployed</h3>
              <p className="text-sm text-green-700">
                Your DEX contracts are connected and ready for trading!
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Router Contract</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={dexConfig?.routerAddress || ''}
                    readOnly
                    className="bg-muted/50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(dexConfig?.routerAddress || '', 'Router address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {dexConfig?.routerAddress && getExplorerUrl(dexConfig.routerAddress) && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(getExplorerUrl(dexConfig.routerAddress), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Factory Contract</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={dexConfig?.factoryAddress || ''}
                    readOnly
                    className="bg-muted/50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(dexConfig?.factoryAddress || '', 'Factory address')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {dexConfig?.factoryAddress && getExplorerUrl(dexConfig.factoryAddress) && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(getExplorerUrl(dexConfig.factoryAddress), '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Swap Fee</Label>
                <Input
                  value={`${dexConfig?.swapFeePercent || 0.3}%`}
                  readOnly
                  className="bg-muted/50 mt-1"
                />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => validateContractDeployment(
                dexConfig?.routerAddress || '',
                dexConfig?.factoryAddress || ''
              )}
              className="w-full"
            >
              Validate Contracts
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">⚠️ Contracts Not Deployed</h3>
              <p className="text-sm text-yellow-700">
                Deploy your DEX contracts and add their addresses below to enable trading.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label htmlFor="router">Router Contract Address</Label>
                <Input
                  id="router"
                  placeholder="0x..."
                  value={routerAddress}
                  onChange={(e) => setRouterAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="factory">Factory Contract Address</Label>
                <Input
                  id="factory"
                  placeholder="0x..."
                  value={factoryAddress}
                  onChange={(e) => setFactoryAddress(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleUpdateContracts}
                disabled={!routerAddress || !factoryAddress || isDeploying}
                className="w-full"
              >
                {isDeploying ? 'Updating...' : 'Update Contract Addresses'}
              </Button>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground space-y-2">
              <h4 className="font-medium text-foreground">Deployment Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Deploy your factory contract first</li>
                <li>Deploy your router contract with the factory address</li>
                <li>Copy both contract addresses</li>
                <li>Paste them above and click "Update Contract Addresses"</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractManager;
