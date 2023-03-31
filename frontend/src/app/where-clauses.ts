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
        public id: number = getUniqueId()
    ) {
        this.logicalOperator = logicalOperator;
        this.whereClause = whereClause;
        this.children = children;
        this.id = id;
    }

    toJson(): any {
        if(this.nodeType == NodeType.LogicalOperator) {
            return { logicalOperator: this.logicalOperator,
                     children: this.children.map(node => node.toJson())}
        } else {
            return this.whereClause;
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