"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';

export default function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId="cmevxxenm00sgji0by9w3z3pd"
            clientId="client-WY6PsBuR7EoZfbt2NJioKxnJKV9Ju1EWGDbqygxMP2iic"
            config={{
                appearance: {
                    walletChainType: 'solana-only',
                    walletList: [
                        'detected_solana_wallets',
                        'phantom',
                        'metamask',
                        'coinbase_wallet',
                        'rainbow',
                    ]
                },
                externalWallets: {
                    solana: {
                        connectors: toSolanaWalletConnectors()
                    },
                },
                solana: {
                    rpcs: {
                        'solana:mainnet': {
                            rpc: createSolanaRpc('https://api.mainnet-beta.solana.com'),
                            rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.mainnet-beta.solana.com')
                        },
                    }
                }
            }}
        >
            {children}
        </PrivyProvider>
    );
}