
import { Token as UniToken, CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core';
import { AlphaRouter } from '@uniswap/smart-order-router';
import { ethers } from 'ethers';
import { Token } from './tokenService';

export class UniswapService {
  private router: AlphaRouter | null = null;
  
  constructor(private provider: ethers.providers.Provider, private chainId: number) {
    this.initializeRouter();
  }

  private async initializeRouter() {
    try {
      this.router = new AlphaRouter({
        chainId: this.chainId,
        provider: this.provider as any
      });
    } catch (error) {
      console.error('Failed to initialize Uniswap router:', error);
    }
  }

  private createUniToken(token: Token): UniToken {
    return new UniToken(
      token.chainId,
      token.address,
      token.decimals,
      token.symbol,
      token.name
    );
  }

  async getQuote(
    fromToken: Token,
    toToken: Token,
    amount: string
  ): Promise<{ outputAmount: string; route: any } | null> {
    if (!this.router) {
      console.error('Router not initialized');
      return null;
    }

    try {
      const tokenIn = this.createUniToken(fromToken);
      const tokenOut = this.createUniToken(toToken);
      
      const amountIn = CurrencyAmount.fromRawAmount(
        tokenIn,
        ethers.utils.parseUnits(amount, fromToken.decimals).toString()
      );

      const route = await this.router.route(
        amountIn,
        tokenOut,
        TradeType.EXACT_INPUT,
        {
          type: 0, // SwapRouter02 type
          recipient: '0x0000000000000000000000000000000000000000', // Will be set by wallet
          slippageTolerance: new Percent(50, 10_000), // 0.5%
          deadline: Math.floor(Date.now() / 1000) + 60 * 20 // 20 minutes
        }
      );

      if (!route) {
        return null;
      }

      return {
        outputAmount: ethers.utils.formatUnits(
          route.quote.quotient.toString(),
          toToken.decimals
        ),
        route
      };
    } catch (error) {
      console.error('Failed to get quote:', error);
      return null;
    }
  }

  async executeSwap(
    fromToken: Token,
    toToken: Token,
    amount: string,
    signer: ethers.Signer
  ): Promise<string | null> {
    try {
      const quote = await this.getQuote(fromToken, toToken, amount);
      if (!quote) {
        throw new Error('No route found');
      }

      const transaction = {
        to: quote.route.methodParameters.to,
        data: quote.route.methodParameters.calldata,
        value: quote.route.methodParameters.value,
        gasLimit: quote.route.estimatedGasUsed.toString()
      };

      const txResponse = await signer.sendTransaction(transaction);
      return txResponse.hash;
    } catch (error) {
      console.error('Failed to execute swap:', error);
      return null;
    }
  }
}
