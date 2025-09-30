import { Address } from "@solana/kit";
import { findAssociatedTokenPda, TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { log } from "../utils/log";

// Owner -> Token -> ATA
const cache = new Map<string, Map<string, Address>>();

export async function getAssociatedTokenAddress(
    owner: Address, 
    token: Address, 
    programId: Address = TOKEN_PROGRAM_ADDRESS
): Promise<Address | null> {
    try {
        if(cache.has(owner)) {
            const cached = cache.get(owner)?.get(token);
            if(cached) {
                return cached;
            }
        } else {
            cache.set(owner, new Map<string, Address>());
        }

        const [tokenAccount] = await findAssociatedTokenPda({
            owner: owner,
            mint: token,
            tokenProgram: programId
        });

        cache.get(owner)!.set(token, tokenAccount);
        return tokenAccount;
    } catch (error) {
        log("error", error);
        return null;
    }
}