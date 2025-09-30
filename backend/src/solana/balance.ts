import { solanaRpc } from "./rpc";
import { NATIVE_SOL_ADDRESS, SOL_DECIMALS } from "../constants";
import { getAssociatedTokenAddress } from "./ata";
import { Address } from "@solana/kit";
import { log } from "../utils/log";

type CachedBalance = {
    amount: number;
    timestamp: number;
};

// Owner -> Token -> Balance
const cache = new Map<string, Map<string, CachedBalance>>();
const cacheTtl = 1000 * 10; // 10 seconds

export async function getTokenBalance(owner: Address, token: Address): Promise<number | null> {
    try {
        if(token === NATIVE_SOL_ADDRESS) {
            return await getSolanaBalance(owner);
        }

        const cachedBalance = cache.get(owner)?.get(token);
        if (cachedBalance && cachedBalance.timestamp > Date.now() - cacheTtl) {
            return cachedBalance.amount;
        } else if(!cache.has(owner)) {
            cache.set(owner, new Map<string, CachedBalance>());
        }

        const tokenAccount = await getAssociatedTokenAddress(owner, token);
        if(tokenAccount === null) {
            return null;
        }

        const balance = await solanaRpc.getTokenAccountBalance(tokenAccount, {
            commitment: "confirmed"
        }).send();

        const amount = Number(balance.value.amount) / (10 ** balance.value.decimals);

        cache.get(owner)?.set(token, { amount: amount, timestamp: Date.now() });
        return amount;
    } catch (error) {
        log("error", error);
        return null;
    }
}

export async function getSolanaBalance(owner: Address): Promise<number | null> {
    try {
        const cachedBalance = cache.get(owner)?.get(NATIVE_SOL_ADDRESS);
        if (cachedBalance && cachedBalance.timestamp > Date.now() - cacheTtl) {
            return cachedBalance.amount;
        } else if(!cache.has(owner)) {
            cache.set(owner, new Map<string, CachedBalance>());
        }

        const balance = await solanaRpc.getBalance(owner, {
            commitment: "confirmed"
        }).send();
        
        const amount = Number(balance.value) / (10 ** SOL_DECIMALS);

        cache.get(owner)?.set(NATIVE_SOL_ADDRESS, { amount: amount, timestamp: Date.now() });
        return amount;
    } catch (error) {
        log("error", error);
        return null;
    }
}