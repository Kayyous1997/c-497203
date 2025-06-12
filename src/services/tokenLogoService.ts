
interface TokenLogo {
  url: string;
  source: 'uniswap' | 'pancakeswap' | 'dexscreener' | 'fallback';
}

class TokenLogoService {
  private logoCache: Map<string, TokenLogo> = new Map();

  async getTokenLogo(address: string, chainId: number, symbol?: string): Promise<TokenLogo> {
    const cacheKey = `${chainId}-${address}`;
    
    if (this.logoCache.has(cacheKey)) {
      return this.logoCache.get(cacheKey)!;
    }

    // Try multiple sources
    const sources = [
      () => this.getUniswapLogo(address, chainId),
      () => this.getPancakeSwapLogo(address, chainId),
      () => this.getDexScreenerLogo(address, chainId),
      () => this.getFallbackLogo(symbol || '')
    ];

    for (const getLogoFn of sources) {
      try {
        const logo = await getLogoFn();
        if (logo) {
          this.logoCache.set(cacheKey, logo);
          return logo;
        }
      } catch (error) {
        console.warn('Failed to fetch logo from source:', error);
      }
    }

    // Ultimate fallback
    const fallback: TokenLogo = {
      url: this.getEmojiForSymbol(symbol || ''),
      source: 'fallback'
    };
    
    this.logoCache.set(cacheKey, fallback);
    return fallback;
  }

  private async getUniswapLogo(address: string, chainId: number): Promise<TokenLogo | null> {
    // Uniswap token list URLs by chain
    const uniswapUrls: Record<number, string> = {
      1: 'https://tokens.uniswap.org/assets/images/tokens/',
      8453: 'https://tokens.uniswap.org/assets/images/tokens/', // Base uses same format
    };

    const baseUrl = uniswapUrls[chainId];
    if (!baseUrl) return null;

    const logoUrl = `${baseUrl}${address.toLowerCase()}.png`;
    
    if (await this.isImageValid(logoUrl)) {
      return { url: logoUrl, source: 'uniswap' };
    }
    
    return null;
  }

  private async getPancakeSwapLogo(address: string, chainId: number): Promise<TokenLogo | null> {
    // PancakeSwap supports BSC and other chains
    if (chainId !== 56 && chainId !== 1) return null; // BSC mainnet or Ethereum
    
    const logoUrl = `https://tokens.pancakeswap.finance/images/${address.toLowerCase()}.png`;
    
    if (await this.isImageValid(logoUrl)) {
      return { url: logoUrl, source: 'pancakeswap' };
    }
    
    return null;
  }

  private async getDexScreenerLogo(address: string, chainId: number): Promise<TokenLogo | null> {
    try {
      // Use our existing DEX Screener service to get token info
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const pair = data.pairs?.[0];
      
      if (pair?.baseToken?.address?.toLowerCase() === address.toLowerCase() && pair.info?.imageUrl) {
        return { url: pair.info.imageUrl, source: 'dexscreener' };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private getFallbackLogo(symbol: string): TokenLogo {
    return {
      url: this.getEmojiForSymbol(symbol),
      source: 'fallback'
    };
  }

  private getEmojiForSymbol(symbol: string): string {
    const emojiMap: Record<string, string> = {
      'ETH': '🔷',
      'WETH': '🔹',
      'BTC': '🟠',
      'WBTC': '🟠',
      'USDC': '💵',
      'USDT': '💰',
      'DAI': '💲',
      'LINK': '🔗',
      'UNI': '🦄',
      'AAVE': '👻',
      'COMP': '🏛️',
      'MKR': '🎯',
      'SNX': '⚡',
      'CRV': '🌊',
      'YFI': '💎',
      'SUSHI': '🍣',
      'MATIC': '🟣',
      'ADA': '💙',
      'DOT': '⚫',
      'SOL': '🌞',
      'AVAX': '🔺',
      'FTT': '🔥',
      'ALGO': '🔷',
      'ATOM': '⚛️',
      'ICP': '∞',
      'VET': '✅',
      'FIL': '📁',
      'TRX': '🔴',
      'ETC': '💚',
      'XLM': '⭐',
      'THETA': '📺',
      'XMR': '🕶️',
      'EOS': '⚫',
      'BSV': '💎',
      'IOTA': '🔸',
      'XTZ': '🔵',
      'NEO': '🟢',
      'DASH': '💠',
      'ZEC': '🛡️',
      'DCR': '🔗',
    };

    return emojiMap[symbol.toUpperCase()] || '❓';
  }

  private async isImageValid(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch {
      return false;
    }
  }

  clearCache(): void {
    this.logoCache.clear();
  }
}

export const tokenLogoService = new TokenLogoService();
