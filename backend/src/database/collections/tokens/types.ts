import { BaseDocument } from "../types";

export type Token = {
    address: string;
    creator: string;
    deploymentSignature: string;
    ideaId: string | null;
    name: string;
    symbol: string;
    description: string;
    imageUrl: string | null;
    website: string | null;
    twitter: string | null;
    telegram: string | null;
    uri: string;
};

export type TokenDocument = BaseDocument & Token;