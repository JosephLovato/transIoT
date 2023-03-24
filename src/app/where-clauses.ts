export interface WhereClause {
    attribute: string,
    operator: Operators,
    key: string
}

export enum Operators {
    Equals = "=",
    NotEquals = "!=",
    GreaterThan = ">",
    LessThan = "<",
    GreaterThanOrEqualTo = ">=",
    LessTHanOrEqualTo = "<=",
    Like = "LIKE"
}