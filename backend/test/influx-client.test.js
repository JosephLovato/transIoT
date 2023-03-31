import { influxClient } from '../influx-client.js';

const exampleNestedWhereClausesOne = `{ "logicalOperator": "or", "children": [{ "attribute": "direction_id", "operator": "!=", "value": "adfasf" }, { "attribute": "route_id", "operator": "==", "value": "asdf" }, { "logicalOperator": "and", "children": [{ "attribute": "direction_id", "operator": "==", "value": "332423" }, { "attribute": "bearing", "operator": "==", "value": "123213" }] }] }`

test('nested where clauses', () => {
    let client = new influxClient();
    expect(client.buildFilterExpression(JSON.parse(exampleNestedWhereClausesOne))).toBe(`(r[direction_id] != \"adfasf\" or r[route_id] == \"asdf\" or (r[direction_id] == \"332423\" and r[bearing] == \"123213\"))`);

})