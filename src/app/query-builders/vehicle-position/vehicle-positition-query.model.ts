import { Query, QueryType } from "src/app/query";
import { WhereClause } from "../../where-clauses";

export class VehiclePositionQuery extends Query {
    type = QueryType.VehiclePosition;
    name;
    now: boolean = true;
    timeInterval?: {
        start: Date,
        end: Date
    }
    whereClauses: WhereClause[] = []

    public constructor(init?: Partial<VehiclePositionQuery>, sequence?: number) {
        super();
        Object.assign(this, init);
        this.name = `Vehicle Position Query (${sequence})`;
    }

    view(): string {
        return this.name;
    }
}

