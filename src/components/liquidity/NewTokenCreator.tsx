
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

interface NewTokenData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  description?: string;
}

interface NewTokenCreatorProps {
  onTokenCreated: (tokenAddress: string, tokenData: NewTokenData) => void;
  onCancel: () => void;
}

const NewTokenCreator: React.FC<NewTokenCreatorProps> = ({ onTokenCreated, onCancel }) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  
  const [tokenData, setTokenData] = useState<NewTokenData>({
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: '',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: keyof NewTokenData, value: string | number) => {
    setTokenData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!tokenData.name.trim()) return 'Token name is required';
    if (!tokenData.symbol.trim()) return 'Token symbol is required';
    if (tokenData.symbol.length > 8) return 'Token symbol must be 8 characters or less';
    if (!tokenData.totalSupply || parseFloat(tokenData.totalSupply) <= 0) return 'Valid total supply is required';
    if (tokenData.decimals < 0 || tokenData.decimals > 18) return 'Decimals must be between 0 and 18';
    return null;
  };

  const handleCreateToken = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a token",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Simulate token creation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate a mock token address
      const mockTokenAddress = '0x' + Math.random().toString(16).substr(2, 40);
      
      toast({
        title: "Token Created Successfully",
        description: `${tokenData.symbol} token has been deployed`,
      });

      onTokenCreated(mockTokenAddress, tokenData);
    } catch (error) {
      console.error('Error creating token:', error);
      toast({
        title: "Token Creation Failed",
        description: "Failed to create token. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getChainName = () => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 8453: return 'Base';
      case 59144: return 'Linea';
      case 11155111: return 'Sepolia';
      default: return 'Unknown Network';
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create New Token</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You're creating a new token on {getChainName()}. This action cannot be undone.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenName">Token Name</Label>
            <Input
              id="tokenName"
              placeholder="e.g., My Awesome Token"
              value={tokenData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tokenSymbol">Token Symbol</Label>
            <Input
              id="tokenSymbol"
              placeholder="e.g., MAT"
              value={tokenData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              maxLength={8}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="decimals">Decimals</Label>
              <Input
                id="decimals"
                type="number"
                value={tokenData.decimals}
                onChange={(e) => handleInputChange('decimals', parseInt(e.target.value) || 0)}
                min={0}
                max={18}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSupply">Total Supply</Label>
              <Input
                id="totalSupply"
                type="number"
                placeholder="1000000"
                value={tokenData.totalSupply}
                onChange={(e) => handleInputChange('totalSupply', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Describe your token..."
              value={tokenData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </div>

        {/* Token Preview */}
        {tokenData.name && tokenData.symbol && (
          <div className="p-4 border rounded-lg bg-muted/20">
            <h4 className="font-semibold mb-2">Token Preview</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-mono">{tokenData.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Symbol:</span>
                <span className="font-mono">{tokenData.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Decimals:</span>
                <span className="font-mono">{tokenData.decimals}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Supply:</span>
                <span className="font-mono">{tokenData.totalSupply}</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="font-mono">{getChainName()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isCreating}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateToken}
            disabled={isCreating || !isConnected}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Token...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Token
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewTokenCreator;
