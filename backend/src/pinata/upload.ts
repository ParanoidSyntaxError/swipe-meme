import { PinataSDK } from "pinata";
import { PumpfunTokenMetadata } from "../pumpfun/types";
import { log } from "../utils/log";

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY_URL
})

export async function uploadPumpfunTokenMetadata(metadata: PumpfunTokenMetadata): Promise<string | null> {
    try {
        const upload = await pinata.upload.public.json(metadata);
        return upload.cid;
    } catch (error) {
        log("error", error);
        return null;
    }
}