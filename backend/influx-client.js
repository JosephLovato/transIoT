'use strict'
/** @module influx-client 
 * Queries a data point in InfluxDB using the Javascript client library with Node.js.
**/

import { InfluxDB } from '@influxdata/influxdb-client'

/** Environment variables and constants **/
const token = process.env.INFLUX_TOKEN
const url = process.env.INFLUX_HOST
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
            // TODO: add special case for NOT operator
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
     * Query InfluxDB for the real-time vehicle positions with an optional filter expression
     * @param {string} filterExpr 
     * @returns json object with metadata and query result
     */
    async queryCurrentVehiclePositions(filterExpr = 'true') {
        let fluxQuery = `
        from(bucket: "RTD-GTFS-NEW")
            |> range(start: -5m, stop: now())
            |> pivot(columnKey: ["_field"], rowKey: ["_time", "vehicle_id"], valueColumn: "_value")
            |> filter(fn: (r) => ${filterExpr})
            |> group(columns: ["vehicle_id"])
            |> max(column: "_time") 
            |> drop(columns: ["_start", "_stop", "_measurement"])`;
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

    /**
     * Query InfluxDB for past vehicle positions with an optional filter expression
     * @param {string} filterExpr 
     * @returns json object with metadata and query result
     */
    async queryPastVehiclePositions(time, filterExpr = 'true') {
        let fluxQuery = `
        from(bucket: "RTD-GTFS-NEW")
            |> range(start: ${time - 300}, stop: ${time})
            |> pivot(columnKey: ["_field"], rowKey: ["_time", "vehicle_id"], valueColumn: "_value")
            |> filter(fn: (r) => ${filterExpr})
            |> group(columns: ["vehicle_id"])
            |> max(column: "_time") 
            |> drop(columns: ["_start", "_stop", "_measurement"])`;
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

    /**
     * Query InfluxDB for vehicle positions over a time interval with an optional filter expression
     * @param {number} timeStart start of time interval
     * @param {number} timeEnd end of time interval 
     * @param {string} filterExpr 
     * @returns 
     */
    async queryIntervalVehiclePositions(timeStart, timeEnd, filterExpr = 'true') {
        let fluxQuery = `
        from(bucket: "RTD-GTFS-NEW")
            |> range(start: ${timeStart}, stop: ${timeEnd})
            |> pivot(columnKey: ["_field"], rowKey: ["_time", "vehicle_id"], valueColumn: "_value")
            |> filter(fn: (r) => ${filterExpr})
            |> group(columns: ["vehicle_id"])
            |> drop(columns: ["_start", "_stop", "_measurement"])`;
        let results = {};
        for await (const { values, tableMeta } of this.queryApi.iterateRows(fluxQuery)) {
            const entry = tableMeta.toObject(values);
            if (results[entry.vehicle_id] == undefined) {
                results[entry.vehicle_id] = [];
            }
            results[entry.vehicle_id].push({
                time: entry._time,
                latitude: entry.latitude,
                longitude: entry.longitude,
                route_id: entry.route_id
            });
        }
        return {
            timeStamp: Date.now().valueOf(),
            data: results
        }
    }

}
