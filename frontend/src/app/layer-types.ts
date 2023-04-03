import { Query } from "./query";

export abstract class RawDataLayer {
    query: Query;
    abstract data: any; 
}