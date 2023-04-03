'use strict'
/** @module influx-client 
 * Queries a data point in InfluxDB using the Javascript client library with Node.js.
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'

/** Environment variables **/
const url = "http://localhost:8086"
const token = process.env.INFLUX_TOKEN
const org = "rtd-local"


export class InfluxClient {
    queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    /**
     * Converts nested where clause json object to filter expression 
     * @param {*} whereClauses 
     * @returns string
     */
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
            return `r["${whereClauses.attribute}"] ${whereClauses.operator} ${whereClauses.value}`;
        }
    }

    /**
     * Query InfluxDB for the real-time vehicle positions with an option filter expression
     * @param {string} filterExpr 
     * @returns json object with metadata and query result
     */
    async queryCurrentVehiclePosition(filterExpr = '') {
        let fluxQuery = `
        from(bucket: "RTD-GTFS-NEW")
            |> range(start: -5m, stop: now())
            |> pivot(columnKey: ["_field"], rowKey: ["_time", "vehicle_id"], valueColumn: "_value")
            |> filter(fn: (r) => ${filterExpr})
            |> group(columns: ["vehicle_id"])
            |> max(column: "_time") 
            |> drop(columns: ["_start", "_stop", "_measurement"])`
        let result = [];
        for await (const { values, tableMeta } of this.queryApi.iterateRows(fluxQuery)) {
            result.push(tableMeta.toObject(values));
        }
        return {
            timeStamp: Date.now().valueOf(),
            numDataPoints: result.length,
            data: result
        }
    }

}
