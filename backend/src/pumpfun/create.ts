import { CreatePumpfunTokenMetadata, CreatedPumpfunToken } from "./types";
import { 
    Address,
    appendTransactionMessageInstruction, 
    createTransactionMessage, 
    assertIsTransactionWithinSizeLimit,
    generateKeyPairSigner, 
    pipe, 
    sendAndConfirmTransactionFactory, 
    setTransactionMessageFeePayerSigner, 
    setTransactionMessageLifetimeUsingBlockhash, 
    signTransactionMessageWithSigners,
    getSignatureFromTransaction,
    createKeyPairSignerFromBytes,
 } from "@solana/kit";
import { solanaRpc, solanaRpcSubscriptions } from "../solana/rpc";
import { getCreateInstructionAsync, PUMP_PROGRAM_ADDRESS } from "../programs/pump";
import { uploadPumpfunTokenMetadata } from "../pinata/upload";
import { log } from "../utils/log";
import { insertToken } from "../database/collections/tokens/collections";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";

export async function createPumpfunToken(
    creator: Address, 
    ideaId: string | null,
    metadata: CreatePumpfunTokenMetadata
): Promise<CreatedPumpfunToken | null> {
    try {
        const [deployer, tokenKeypair, metadataCid] = await Promise.all([
            createKeyPairSignerFromBytes(bs58.decode(process.env.SOLANA_FEE_PAYER)),
            generateKeyPairSigner(),
            uploadPumpfunTokenMetadata({
                ...metadata,
                showName: true,
                createdOn: "https://pump.fun",
            })
        ]);
        if(metadataCid === null) {
            return null;
        }

        const tokenUri = `https://ipfs.io/ipfs/${metadataCid}`;

        const [createPumpTokenInstruction, latestBlockhash] = await Promise.all([
            getCreateInstructionAsync({
                name: metadata.name,
                symbol: metadata.symbol,
                uri: tokenUri,
                creator: deployer.address,
                user: deployer,
                mint: tokenKeypair,
                program: PUMP_PROGRAM_ADDRESS,
            }),
            solanaRpc.getLatestBlockhash().send()
        ]);

        const transactionMessage = pipe(
            createTransactionMessage({
                version: 0,
            }),
            (m) => setTransactionMessageFeePayerSigner(deployer, m),
            (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash.value, m),
            (m) => appendTransactionMessageInstruction(createPumpTokenInstruction, m),
        );        
        const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
        assertIsTransactionWithinSizeLimit(signedTransaction);

        const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
            rpc: solanaRpc,
            rpcSubscriptions: solanaRpcSubscriptions,
        });

        await sendAndConfirmTransaction(signedTransaction, {
            commitment: "confirmed",
        });
        const signature = getSignatureFromTransaction(signedTransaction);

        await insertToken({
            address: tokenKeypair.address,
            creator: creator,
            deploymentSignature: signature,
            ideaId: ideaId,
            name: metadata.name,
            symbol: metadata.symbol,
            description: metadata.description,
            imageUrl: metadata.image,
            website: metadata.website ?? null,
            twitter: metadata.twitter ?? null,
            telegram: metadata.telegram ?? null,
            uri: tokenUri,
        });

        return {
            address: tokenKeypair.address,
            deploymentSignature: signature,
        };
    } catch (error) {
        log("error", error);
        return null;
    }
}