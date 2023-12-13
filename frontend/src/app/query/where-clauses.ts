export interface WhereClause {
    attribute: string,
    operator: Operator,
    value: string,
    valueType?: string
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
    toJson(): object {
        if (this.nodeType == NodeType.LogicalOperator) {
            return {
                logicalOperator: this.logicalOperator,
                children: this.children.map(node => node.toJson())
            }
        } else {
            return this.whereClause;
        }
    }

    /**
     * Converts the where clause tree to an SQL string
     * @returns string
     */
    toSQLString(): string {
        // recursive case
        if (this.nodeType == NodeType.LogicalOperator) {
            // special case for NOT operator
            if (this.logicalOperator == LogicalOperator.Not) {
                // temporally change top 'not' to 'or'
                this.logicalOperator = LogicalOperator.Or
                const ret = `not ${this.toSQLString()}`;
                // change back to 'not'
                this.logicalOperator = LogicalOperator.Not;
                return ret;
            } else {
                const expr = this.children.flatMap((value, index, array) => {
                    return array.length - 1 !== index ?
                        [value.toSQLString(), this.logicalOperator] :
                        [value.toSQLString()]
                }).join(' ');
                return `(${expr})`
            }
        } else {
            // base case
            const value = this.whereClause.valueType == 'string' ? `'${this.whereClause.value}'` : this.whereClause.value;
            return `${this.whereClause.attribute} ${OperatorToSql[this.whereClause.operator]} ${value}`;
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

const OperatorToSql: { [key: string]: string } = {
    '': '',
    '==': '=',
    '!=': '<>',
    '>': '>',
    '<': '<',
    '>=': '>=',
    '<=': '<=',
    'LIKE': 'LIKE'
}