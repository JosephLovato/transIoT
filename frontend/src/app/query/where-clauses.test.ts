import { ClauseNode, LogicalOperator, NodeType, Operator } from './where-clauses';

/**** Clause Node Tests ****/

test('default constructor', () => {
    const node = new ClauseNode()
    expect(node.children).toEqual([]);
    expect(node.id).toBeGreaterThanOrEqual(0);
    expect(node.logicalOperator).toBe(LogicalOperator.None);
    expect(node.nodeType).toBe(NodeType.Clause);
    expect(node.parent).toBe(null);
    expect(node.whereClause).toEqual({ attribute: '', operator: Operator.None, value: '' });
    expect(node.toJson()).toEqual({ attribute: '', operator: Operator.None, value: '' });
    expect(node.toSQLString()).toEqual('  ');
});

test('simple clause', () => {
    const node = new ClauseNode();
    node.whereClause = { attribute: 'x', operator: Operator.Equals, value: '0' };
    expect(node.children).toEqual([]);
    expect(node.id).toBeGreaterThanOrEqual(0);
    expect(node.logicalOperator).toBe(LogicalOperator.None);
    expect(node.nodeType).toBe(NodeType.Clause);
    expect(node.parent).toBe(null);
    expect(node.whereClause).toEqual({ attribute: 'x', operator: Operator.Equals, value: '0' });
    expect(node.toJson()).toEqual({ attribute: 'x', operator: Operator.Equals, value: '0' });
    expect(node.toSQLString()).toEqual('x = 0');
});

test('clause with string value', () => {
    const node = new ClauseNode();
    node.whereClause = { attribute: 'x', operator: Operator.Equals, value: 'foo', valueType: 'string' };
    expect(node.toSQLString()).toEqual(`x = 'foo'`);
});

test('clause with non-string value', () => {
    const node = new ClauseNode();
    node.whereClause = { attribute: 'x', operator: Operator.Equals, value: '42', valueType: 'integer' };
    expect(node.toSQLString()).toEqual('x = 42');
});

test('two clauses', () => {
    const x = new ClauseNode();
    x.whereClause = { attribute: 'x', operator: Operator.Equals, value: '0' };
    const y = new ClauseNode();
    y.whereClause = { attribute: 'y', operator: Operator.NotEquals, value: '42' };
    const node = new ClauseNode(NodeType.LogicalOperator, LogicalOperator.And);
    node.children = [x, y];
    expect(node.toJson()).toEqual({
        logicalOperator: LogicalOperator.And,
        children: [
            { attribute: 'x', operator: Operator.Equals, value: '0' },
            { attribute: 'y', operator: Operator.NotEquals, value: '42' }
        ]
    });
    expect(node.toSQLString()).toEqual('(x = 0 and y <> 42)');
});

test('2-levels deep', () => {
    const x = new ClauseNode();
    x.whereClause = { attribute: 'x', operator: Operator.Equals, value: '0' };
    const y = new ClauseNode();
    y.whereClause = { attribute: 'y', operator: Operator.NotEquals, value: '42' };
    const z = new ClauseNode();
    z.whereClause = { attribute: 'z', operator: Operator.GreaterThan, value: '-12' };
    const orNode = new ClauseNode(NodeType.LogicalOperator, LogicalOperator.Or);
    orNode.children = [y, z];
    const node = new ClauseNode(NodeType.LogicalOperator, LogicalOperator.And);
    node.children = [x, orNode];
    expect(node.toSQLString()).toEqual('(x = 0 and (y <> 42 or z > -12))');
});

test('not of two clauses', () => {
    const x = new ClauseNode();
    x.whereClause = { attribute: 'x', operator: Operator.Equals, value: '0' };
    const y = new ClauseNode();
    y.whereClause = { attribute: 'y', operator: Operator.NotEquals, value: '42' };
    const node = new ClauseNode(NodeType.LogicalOperator, LogicalOperator.Not);
    node.children = [x, y];
    expect(node.toJson()).toEqual({
        logicalOperator: LogicalOperator.Not,
        children: [
            { attribute: 'x', operator: Operator.Equals, value: '0' },
            { attribute: 'y', operator: Operator.NotEquals, value: '42' }
        ]
    });
    expect(node.toSQLString()).toEqual('not (x = 0 or y <> 42)');
});

test('not of one clauses', () => {
    const x = new ClauseNode();
    x.whereClause = { attribute: 'x', operator: Operator.Equals, value: '0' };
    const node = new ClauseNode(NodeType.LogicalOperator, LogicalOperator.Not);
    node.children = [x];
    expect(node.toJson()).toEqual({
        logicalOperator: LogicalOperator.Not,
        children: [
            { attribute: 'x', operator: Operator.Equals, value: '0' },]
    });
    expect(node.toSQLString()).toEqual('not (x = 0)');
});