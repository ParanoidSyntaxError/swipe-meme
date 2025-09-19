import { Connection } from "@solana/web3.js";

export const solanaRpc = new Connection(process.env.SOLANA_RPC, "confirmed");