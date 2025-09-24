export enum SortDirection {
    Ascending = 1,
    Descending = -1,
}

export type BaseDocument = {
    _id: string;
    createdAt: Date;
};