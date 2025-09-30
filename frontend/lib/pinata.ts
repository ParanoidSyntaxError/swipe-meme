"use server";

import { PinataSDK } from "pinata";
import { PumpfunTokenMetadata } from "@swipememe-api/types";

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY_URL
});

export async function uploadPumpfunTokenMetadata(metadata: PumpfunTokenMetadata): Promise<string | null> {
    try {
        const upload = await pinata.upload.public.json(metadata);
        return upload.cid;
    } catch (error) {
        console.error(error);
        return null;
    }
}