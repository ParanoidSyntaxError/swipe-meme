"use server";

import { Connection, PublicKey } from "@solana/web3.js";

type CachedLamportBalance = {
    lamports: number;
    timestamp: number;
};

const cache = new Map<string, CachedLamportBalance>();
const cacheTtl = 1000 * 10; // 10 seconds

const connection = new Connection(process.env.SOLANA_RPC!, "confirmed");

export async function getLamportBalance(address: string): Promise<number | null> {
    try {
        const cachedBalance = cache.get(address);
        if (cachedBalance && cachedBalance.timestamp > Date.now() - cacheTtl) {
            return cachedBalance.lamports;
        }

        const lamports = await connection.getBalance(new PublicKey(address));
        cache.set(address, { lamports, timestamp: Date.now() });
        return lamports;
    } catch (error) {
        console.error("Error getting lamport balance:", error);
        return null;
    }
}