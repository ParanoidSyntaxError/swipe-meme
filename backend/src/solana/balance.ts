import { PublicKey } from "@solana/web3.js";
import { solanaRpc } from "./rpc";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { NATIVE_SOL_ADDRESS } from "../constants";

type CachedBalance = {
    amount: number;
    timestamp: number;
};

// Owner -> Token -> Balance
const cache = new Map<string, Map<string, CachedBalance>>();
const cacheTtl = 1000 * 10; // 10 seconds

export async function getTokenBalance(token: string, owner: string): Promise<number | null> {
    try {
        if(token === NATIVE_SOL_ADDRESS) {
            return getLamportBalance(owner);
        }

        const cachedBalance = cache.get(owner)?.get(token);
        if (cachedBalance && cachedBalance.timestamp > Date.now() - cacheTtl) {
            return cachedBalance.amount;
        }

        const tokenAccount = getAssociatedTokenAddressSync(
            new PublicKey(token),
            new PublicKey(owner)
        );

        const tokenBalance = await solanaRpc.getTokenAccountBalance(tokenAccount);
        const amount = Number(tokenBalance.value.amount) / (10 ** tokenBalance.value.decimals);

        if(!cache.has(owner)) {
            cache.set(owner, new Map<string, CachedBalance>());
        }
        cache.get(owner)?.set(token, { amount, timestamp: Date.now() });
        return amount;
    } catch (error) {
        console.error("Error getting token balance:", error);
        return null;
    }
}

export async function getLamportBalance(owner: string): Promise<number | null> {
    try {
        const cachedBalance = cache.get(owner)?.get(NATIVE_SOL_ADDRESS);
        if (cachedBalance && cachedBalance.timestamp > Date.now() - cacheTtl) {
            return cachedBalance.amount;
        }

        const lamports = await solanaRpc.getBalance(new PublicKey(owner));
        
        if(!cache.has(owner)) {
            cache.set(owner, new Map<string, CachedBalance>());
        }
        cache.get(owner)?.set(NATIVE_SOL_ADDRESS, { amount: lamports, timestamp: Date.now() });
        return lamports;
    } catch (error) {
        console.error("Error getting lamport balance:", error);
        return null;
    }
}