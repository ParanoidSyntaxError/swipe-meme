import { IdeaDocument } from "../../../types";

export type NewestIdeasRequest = {
    limit?: number;
    excludedPages?: number[];
};

export type NewestIdeasResponse = {
    page: number;
    ideas: IdeaDocument[];
};