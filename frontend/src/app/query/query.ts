import { ClauseNode } from "./where-clauses";

export abstract class Query {
    // this allows us to access the overridden static member of derived classes
    public derivedClass = (this.constructor as typeof Query);

    protected _time: Date = new Date();
    protected _type: QueryType;
    protected static _attributes: Attributes;
    visible: boolean = true;
    color: string;
    whereClauses: ClauseNode | null = new ClauseNode();
    layerType: LayerType;
    name: string;
    abstract view(): string;
    abstract populateAttributes(): void;
    get id(): string { return this._time.getTime().toString() }
    public get type(): QueryType { return this._type }
    public get time(): Date { return this._time }
    public get attributes(): Attributes { return this.derivedClass._attributes }
}


export enum QueryType {
    VehiclePosition = "Vehicle Position",
    BusStops = "Bus Stops",
    BusRoutes = "Bus Routes"
}

export enum LayerType {
    Point = "Point",
    Line = "Line"
}

export type Attributes = { [key: string]: Attribute }

export interface Attribute {
    name: string;
    type: string;
    possibleValues: { [key: string | number]: string | number }
}