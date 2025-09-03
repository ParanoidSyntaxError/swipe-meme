"use server";

export type TokenIdea = {
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
};

const placeholderIdeas = [
    {
        name: "Catwifgyatt",
        symbol: "GYATT",
        description: "Its a cat wif a gyatt",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
    {
        name: "Racist fish",
        symbol: "RFISH",
        description: "A racist fish that hates minorities",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
    {
        name: "FSH",
        symbol: "FSH",
        description: "You already know what dev is gonna do",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
    {
        name: "Ser",
        symbol: "SER",
        description: "Ser, do the needful, my village is hungry",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
    {
        name: "N Word Pass",
        symbol: "NWORD",
        description: "An onchain pass to say THE word",
        imageUrl: `https://picsum.photos/400?random=${Math.random()}`
    },
];

export async function getTokenIdeas(): Promise<TokenIdea[]> {
    return placeholderIdeas;
}