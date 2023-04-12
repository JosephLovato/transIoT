import { Query } from "./query/query";

export abstract class RawDataLayer {
    query: Query;
    abstract data: any;
}