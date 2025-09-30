export type TokenCreateRequest = {
    creator: string;
    ideaId?: string;
    name: string;
    symbol: string;
    description: string;
    image: string;
    website?: string;
    twitter?: string;
    telegram?: string;
};

export type TokenCreateResponse = {
    address: string;
    deploymentSignature: string;
};

export type TokenBalanceQuery = {
    token: string;
    owner: string;
};

export type TokenBalanceResponse = {
    owner: string;
    token: string;
    amount: number;
};