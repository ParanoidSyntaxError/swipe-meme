import { Request, Response } from "express";
import { TokenCreateRequest, TokenCreateResponse } from "./types";
import { isAddress } from "@solana/kit";
import { log } from "../../../utils/log";
import { createPumpfunToken } from "../../../pumpfun/create";

/**
 * POST /token/create
 */
export async function createTokenHandler(req: Request, res: Response) {
    try {
        const body = req.body as TokenCreateRequest;

        if(body.name === "" || body.symbol === "" || !isAddress(body.creator)) {
            res.status(400).json({ error: "Invalid request body" });
            return;
        }

        const pfToken = await createPumpfunToken(body.creator, body.ideaId ?? null, {
            name: body.name,
            symbol: body.symbol,
            description: body.description,
            image: body.image,
            website: body.website,
            twitter: body.twitter,
            telegram: body.telegram,
        });
        if(pfToken === null) {
            res.status(500).json({ error: "Failed to create token" });
            return;
        }

        const response: TokenCreateResponse = {
            address: pfToken.address,
            deploymentSignature: pfToken.deploymentSignature,
        };
        res.status(200).json(response);
    } catch (error) {
        log("error", error);
        res.status(500).json({ error: "Failed to create token" });
    }
}