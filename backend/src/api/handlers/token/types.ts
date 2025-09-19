export type TokenBalanceQuery = {
    token: string;
    owner: string;
};

export type TokenBalanceResponse = {
    owner: string;
    token: string;
    amount: number;
};