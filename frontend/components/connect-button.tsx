"use client";

import { usePrivy } from '@privy-io/react-auth';
import { Button } from './ui/button';
import { ConnectedStandardSolanaWallet, useConnectedStandardWallets } from '@privy-io/react-auth/solana';
import { cn, shortenAddress } from '@/lib/utils';
import Spinner from '@/components/ui/spinner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from 'react';
import { getLamportBalance } from '@/lib/balance';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { CopyIcon, LogOutIcon } from 'lucide-react';

export function formatSolBalance(lamports: number | null): string {
    if (lamports === null) {
        return "0";
    }

    const sol = lamports / LAMPORTS_PER_SOL;
    if (sol >= 1) {
        return Math.floor(sol).toLocaleString();
    } else if (sol > 0) {
        return sol.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 3,
        });
    } else {
        return "0";
    }
}

export default function ConnectButton() {
    const { ready: privyReady, connectWallet } = usePrivy();
    const { ready: walletsReady, wallets } = useConnectedStandardWallets();

    const [ready, setReady] = useState<boolean>(false);
    const [wallet, setWallet] = useState<ConnectedStandardSolanaWallet | null>(null);
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        if (privyReady && walletsReady) {
            setReady(true);
            if (wallets.length > 0) {
                setWallet(wallets[0]);
            }
        }
    }, [privyReady, walletsReady, wallets]);

    useEffect(() => {
        if (wallet) {
            getLamportBalance(wallet.address).then((balance) => {
                setBalance(balance);
            });
        }
    }, [wallet]);

    const handleConnect = async () => {
        if (wallet === null) {
            connectWallet();
        }
    };

    const handleDisconnect = async () => {
        if (wallet) {
            wallet.disconnect();
            setWallet(null);
            setBalance(null);
        }
    };

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={wallet === null}>
                    <Button
                        disabled={!ready}
                        onClick={handleConnect}
                        className={cn(
                            "flex flex-row items-center justify-center w-40 h-14 rounded-full transition-all duration-300 hover:scale-105 active:scale-95",
                            wallet ? "bg-white text-xl font-bold border-4 border-gray-200" :
                                "bg-[#ee2c80] text-white text-2xl font-extrabold border-4 border-[#f695bf]",
                        )}
                    >
                        {wallet ?
                            <div className="flex flex-row items-center gap-x-2">
                                <span>{`${shortenAddress(wallet.address)}`}</span>
                            </div> :
                            ready ? "Connect" : <Spinner className="scale-175" />
                        }
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-42 border-3 border-gray-200 rounded-xl'>
                    <DropdownMenuLabel className='flex flex-row items-center gap-x-2'>
                        <div className='text-gray-700 text-xl font-bold'>
                            {`${formatSolBalance(balance)} SOL`}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator
                        className='bg-gray-200'
                    />
                    <DropdownMenuItem
                        className='text-gray-700 text-base hover:bg-gray-100 cursor-pointer'
                        onClick={() => {
                            navigator.clipboard.writeText(wallet?.address || '');
                        }}
                    >
                        <CopyIcon className='w-4 h-4' />
                        Copy Address
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className='text-gray-700 text-base hover:bg-gray-100 cursor-pointer'
                        onClick={handleDisconnect}
                    >
                        <LogOutIcon className='w-4 h-4' />
                        Disconnect
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}