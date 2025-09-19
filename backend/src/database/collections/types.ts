import { ObjectId } from "mongodb";

export enum SortDirection {
    Ascending = 1,
    Descending = -1,
}

export type BaseDocument = {
    _id: ObjectId;
    createdAt: Date;
};