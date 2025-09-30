"use server";

import { createSolanaRpc } from "@solana/kit";

const solanaRpc = createSolanaRpc(process.env.SOLANA_RPC);

export async function getLatestBlockhash(): Promise<{
    blockhash: string;
    lastValidBlockHeight: string;
} | null> {
    try {
        const { value: latestBlockhash } = await solanaRpc.getLatestBlockhash({
            commitment: "processed"
        }).send();

        return {
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight.toString()
        };
    } catch(error) {
        console.error(error);
        return null;
    }
}