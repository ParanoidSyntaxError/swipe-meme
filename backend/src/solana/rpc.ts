import { createSolanaRpcSubscriptions, createSolanaRpc } from "@solana/kit";

export const solanaRpc = createSolanaRpc(process.env.SOLANA_RPC);
export const solanaRpcSubscriptions = createSolanaRpcSubscriptions(process.env.SOLANA_RPC_WSS);