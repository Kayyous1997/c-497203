import MarketStats from "@/components/MarketStats";
import SwapInterface from "@/components/SwapInterface";
import CryptoList from "@/components/CryptoList";
import PortfolioDashboard from "@/components/PortfolioDashboard";
import TradingChart from "@/components/TradingChart";
import TransactionHistory from "@/components/TransactionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crypto DEX Dashboard</h1>
          <p className="text-muted-foreground">Trade, track, and manage your crypto portfolio</p>
        </header>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <MarketStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TradingChart symbol="ETH" />
              </div>
              <div>
                <SwapInterface />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioDashboard />
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TradingChart symbol="ETH" />
              </div>
              <div>
                <SwapInterface />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionHistory />
          </TabsContent>

          <TabsContent value="markets">
            <CryptoList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
