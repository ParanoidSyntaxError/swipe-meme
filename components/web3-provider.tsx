"use client";

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

export default function Web3Provider({ children }: { children: React.ReactNode }) {
    const solanaConnectors = toSolanaWalletConnectors({
        // By default, shouldAutoConnect is enabled
        shouldAutoConnect: true
    });

    return (
        <PrivyProvider
            appId="cmevxxenm00sgji0by9w3z3pd"
            clientId="client-WY6PsBuR7EoZfbt2NJioKxnJKV9Ju1EWGDbqygxMP2iic"
            config={{
                appearance: {
                    showWalletLoginFirst: true,
                    walletChainType: 'solana-only',
                },
                externalWallets: {
                    solana: {
                        connectors: solanaConnectors
                    },
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}