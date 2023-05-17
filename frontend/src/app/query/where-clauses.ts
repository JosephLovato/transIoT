export interface WhereClause {
    attribute: string,
    operator: Operator,
    value: string
}

export enum Operator {
    None = '',
    Equals = '==',
    NotEquals = '!=',
    GreaterThan = '>',
    LessThan = '<',
    GreaterThanOrEqualTo = '>=',
    LessTHanOrEqualTo = '<=',
    Like = 'LIKE'
}

let id = 0;

function getUniqueId(): number {
    return id++;
}

export class ClauseNode {
    constructor(
        public nodeType: NodeType = NodeType.Clause,
        public logicalOperator: LogicalOperator = LogicalOperator.None,
        public whereClause: WhereClause = { attribute: '', operator: Operator.None, value: '' },
        public children: ClauseNode[] = [],
        public id: number = getUniqueId(),
        public parent: ClauseNode | null = null
    ) {
        this.logicalOperator = logicalOperator;
        this.whereClause = whereClause;
        this.children = children;
        this.id = id;
    }

    /**
     * Converts the where clause tree to a JSON object
     * @returns JSON object
     */
    toJson(): any {
        if(this.nodeType == NodeType.LogicalOperator) {
            return { logicalOperator: this.logicalOperator,
                     children: this.children.map(node => node.toJson())}
        } else {
            return this.whereClause;
        }
    }

    /**
     * Converts the where clause tree to an SQL string
     * @returns string
     */
    toSQLString(): string {
        if(this.nodeType == NodeType.LogicalOperator) {
            return this.children.flatMap((value, index, array) => {
                array.length - 1 !== index ?
                [value, this.logicalOperator] :
                [value]
            }).join(" ");
        } else {
            return `${this.whereClause.attribute} ${this.whereClause.operator} ${this.whereClause.value}`;
        }
    }
}

export enum NodeType {
    Clause = 'clause',
    LogicalOperator = 'logical operator'
}


export enum LogicalOperator {
    And = 'and',
    Or = 'or',
    Not = 'not',
    None = ''
}