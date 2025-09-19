import { BaseDocument } from "../types";

export type Idea = {
    name: string;
    symbol: string;
    description: string;
    imageUrl: string | null;
};

export type IdeaDocument = BaseDocument & Idea & {
    page: number;
};