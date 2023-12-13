import { Query } from "./query";

export abstract class InfluxQuery extends Query {
    override populateAttributes(): void {
        throw Error("Not Applicable");
    }
}