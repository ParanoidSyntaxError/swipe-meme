export type PumpfunTokenMetadata = {
    name: string;
    symbol: string;
    description: string;
    image: string;
    showName: boolean;
    createdOn: string;
    website?: string;
    twitter?: string;
    telegram?: string;
};

export type CreatePumpfunTokenMetadata = Omit<PumpfunTokenMetadata, "showName" | "createdOn">;

export type CreatedPumpfunToken = {
    address: string;
    deploymentSignature: string;
};