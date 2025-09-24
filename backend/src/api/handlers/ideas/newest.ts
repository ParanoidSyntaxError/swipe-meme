import { Request, Response } from "express";
import { getNewestIdeas } from "../../../database/collections/ideas/collection";
import { NewestIdeasRequest, NewestIdeasResponse } from "./types";
import { generateIdeas } from "../../../ideas/generate";
import { log } from "../../../utils/log";

/**
 * POST /ideas/newest
 */
export async function newestIdeasHandler(req: Request, res: Response) {
    try {
        const body = req.body as NewestIdeasRequest;

        // Catch to avoid blocking the request
        generateIdeas().catch();

        const ideas = await getNewestIdeas(body?.excludedPages, body?.limit);
        if(ideas === null || ideas.length === 0) {
            res.status(404).json({ error: "No ideas found" });
            return;
        }

        const response: NewestIdeasResponse = {
            page: ideas[0].page,
            ideas: ideas
        };
        res.json(response);
    } catch (error) {
        log("error", error);
        res.status(500).json({ error: "Failed to get newest ideas" });
    }
}