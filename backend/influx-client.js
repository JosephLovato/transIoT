'use strict'
/** @module influx-client 
 * Queries a data point in InfluxDB using the Javascript client library with Node.js.
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'

/** Environment variables **/
const url = "http://localhost:8086"
const token = process.env.INFLUX_TOKEN
const org = "rtd-local"


export class influxClient {
    queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    buildFilterExpression(whereClauses) {
        // logical operator
        if (whereClauses.hasOwnProperty('logicalOperator')) {
            let expr = '(';
            let op = whereClauses.logicalOperator;
            whereClauses.children.forEach((clause, i) => {
                expr += this.buildFilterExpression(clause);
                if (i < whereClauses.children.length - 1) expr += ` ${op} `;
            });
            expr += ')'
            return expr;
            // clause
        } else {
            return `r[${whereClauses.attribute}] ${whereClauses.operator} "${whereClauses.value}"`;
        }
    }

    
}


const fluxQuery = `
    from(bucket: "RTD-GTFS")
        |> range(start: -5m, stop: now())
        |> filter(fn: (r) => r["_field"] == "bearing" or r["_field"] == "latitude" or r["_field"] == "longitude")
        |> pivot(columnKey: ["_field"], rowKey: ["_time", "vehicle_id"], valueColumn: "_value")
        |> group(columns: ["vehicle_id"])
        |> drop(columns: ["_start", "_stop", "_measurement"])`

const myQuery = async () => {
    var d = new Map();
    for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
        console.log("wow");
        const o = tableMeta.toObject(values)
        d[o.vehicle_id] += o;
    }
    console.log(d)
}

/** Execute a query and receive line table metadata and rows. */
// myQuery()