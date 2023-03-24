import * as Color from "color";

export abstract class Query {
    time: Date = new Date();
    visible: boolean = true;
    color: string;
    abstract type: QueryType;
    abstract name: string;
    abstract view(): string;
    get id(): string { return this.time.getTime().toString() };
}

export enum QueryType {
    VehiclePosition = "Vehicle Position"
}