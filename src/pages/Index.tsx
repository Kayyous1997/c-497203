
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  Lock,
  Coins,
  Globe,
  Star,
  ChevronDown,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { label: "Total Volume", value: "$2.1B+", change: "+12.5%" },
    { label: "Active Users", value: "50K+", change: "+8.2%" },
    { label: "Liquidity Pools", value: "1,200+", change: "+15.1%" },
    { label: "Supported Tokens", value: "500+", change: "+5.7%" }
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Swaps",
      description: "Execute trades in seconds with minimal slippage and maximum efficiency.",
      color: "text-yellow-400"
    },
    {
      icon: Shield,
      title: "Maximum Security",
      description: "Audited smart contracts and decentralized architecture ensure your funds are safe.",
      color: "text-green-400"
    },
    {
      icon: Coins,
      title: "Multi-Chain Support",
      description: "Trade across multiple blockchains with seamless cross-chain functionality.",
      color: "text-blue-400"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time charts, price feeds, and detailed market analysis tools.",
      color: "text-purple-400"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of traders in our vibrant DeFi community.",
      color: "text-pink-400"
    },
    {
      icon: Lock,
      title: "Non-Custodial",
      description: "You maintain full control of your assets at all times.",
      color: "text-red-400"
    }
  ];

  const topTokens = [
    { symbol: "ETH", name: "Ethereum", price: "$3,245.67", change: "+2.34%", volume: "$1.2B" },
    { symbol: "BTC", name: "Bitcoin", price: "$67,890.12", change: "+1.87%", volume: "$890M" },
    { symbol: "USDC", name: "USD Coin", price: "$1.00", change: "0.00%", volume: "$2.1B" },
    { symbol: "UNI", name: "Uniswap", price: "$8.45", change: "+5.67%", volume: "$120M" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              transform: `translateY(${scrollY * 0.5}px)`,
              background: 'radial-gradient(circle at 20% 50%, rgba(137, 137, 222, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(126, 191, 142, 0.3) 0%, transparent 50%)'
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <Badge className="mb-6 animate-fade-in" variant="outline">
            🚀 The Future of Decentralized Trading
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up bg-gradient-to-r from-primary via-success to-accent bg-clip-text text-transparent">
            Trade Without Limits
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Experience the next generation of decentralized finance with lightning-fast swaps, 
            deep liquidity, and maximum security.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <Button size="lg" className="text-lg px-8 py-6 hover-scale group">
              <Link to="/liquidity" className="flex items-center">
                Start Trading
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 hover-scale group">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card 
                key={stat.label} 
                className="text-center p-6 hover-scale animate-fade-in glass-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground mb-2">{stat.label}</div>
                  <Badge variant="outline" className="text-success">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose Our DEX?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for traders, by traders. Experience the most advanced decentralized exchange.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="p-6 hover-scale animate-fade-in glass-card group hover:border-primary/20 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${feature.color.split('-')[1]}-400/20 to-${feature.color.split('-')[1]}-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Tokens Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Trending Tokens</h2>
            <p className="text-xl text-muted-foreground">
              Most traded tokens on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topTokens.map((token, index) => (
              <Card 
                key={token.symbol}
                className="p-6 hover-scale animate-fade-in glass-card group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="font-bold text-sm">{token.symbol}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{token.symbol}</div>
                        <div className="text-sm text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                    <Star className="h-4 w-4 text-muted-foreground group-hover:text-yellow-400 transition-colors" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-medium">{token.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">24h</span>
                      <Badge variant="outline" className="text-success">
                        {token.change}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volume</span>
                      <span className="text-sm">{token.volume}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10">
        <div className="max-w-4xl mx-auto text-center">
          <Globe className="h-16 w-16 mx-auto mb-6 text-primary animate-pulse-subtle" />
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of traders who trust our platform for their DeFi needs. 
            Start your journey today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-6 hover-scale">
              <Link to="/liquidity" className="flex items-center">
                Launch App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 hover-scale">
              Read Documentation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
