import { Request, Response } from "express";
import { getTokenBalance } from "../../../solana/balance";
import { TokenBalanceQuery, TokenBalanceResponse } from "./types";
import { address } from "@solana/kit";
import { log } from "../../../utils/log";

/**
 * GET /token/balance
 */
export async function tokenBalanceHandler(req: Request, res: Response) {
    try {
        const query = req.query as TokenBalanceQuery;
        const balance = await getTokenBalance(address(query.owner), address(query.token));
        if(balance === null) {
            res.status(404).json({ error: "Token balance not found" });
            return;
        }

        const response: TokenBalanceResponse = {
            owner: query.owner,
            token: query.token,
            amount: balance
        };
        res.json(response);
    } catch (error) {
        log("error", error);
        res.status(500).json({ error: "Failed to get token balance" });
    }
}