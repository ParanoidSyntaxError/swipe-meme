import { Request, Response } from "express";

export async function ideasPageHandler(req: Request, res: Response) {
    try {

    } catch (error) {
        console.error("Error getting ideas:", error);
        res.status(500).json({ error: "Failed to get ideas" });
    }
}