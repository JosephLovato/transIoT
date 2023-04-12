import { throwError } from "rxjs";
import { Query } from "./query";

export abstract class InfluxQuery extends Query {
    override populateAttributes(): void {
        throw Error("Not implemented");
    }
}