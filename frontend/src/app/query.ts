import { ClauseNode, WhereClause } from "./where-clauses";

export abstract class Query {
    protected _time: Date = new Date();
    protected _type: QueryType;
    visible: boolean = true;
    color: string;
    whereClauses: ClauseNode | null = new ClauseNode();
    layerType: LayerType;
    name: string;
    abstract view(): string;
    get id(): string { return this._time.getTime().toString() };
    public get type(): QueryType { return this._type };
    public get time(): Date { return this._time };

}


export enum QueryType {
    VehiclePosition = "Vehicle Position"
}

export enum LayerType {
    Point = "Point",
    Line = "Line"
}

export type Attributes = { [key: string]: Attribute }

export interface Attribute {
    name: string;
    type: string;
    possibleValues: { [key: string]: string }
}