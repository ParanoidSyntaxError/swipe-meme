import { Request, Response } from "express";
import { getNewestIdeas } from "../../../database/collections/ideas/collection";
import { NewestIdeasResponse } from "./types";

export async function newestIdeasHandler(req: Request, res: Response) {
    try {
        const ideas = await getNewestIdeas();
        if(ideas === null) {
            res.status(404).json({ error: "No ideas found" });
            return;
        }

        const response: NewestIdeasResponse = {
            ideas: ideas
        };
        res.json(response);
    } catch (error) {
        console.error("Error getting newest ideas:", error);
        res.status(500).json({ error: "Failed to get newest ideas" });
    }
}