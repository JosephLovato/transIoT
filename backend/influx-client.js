"use strict";
/** @module influx-client 
 * Queries data in InfluxDB using the Javascript client library with Node.js.
**/

import { InfluxDB, toFluxValue } from "@influxdata/influxdb-client";

/** Environment variables and constants **/
const token = process.env.INFLUX_TOKEN;
const url = process.env.INFLUX_HOST;
const org = "rtd-local";

const validOperators = ["==", "!=", ">", "<", ">=", "<=", "LIKE"];
const validLogicalOperators = ["and", "or", "not"];

export class SanitizationError extends Error {
    constructor(msg) {
        super(msg);
    }
}

export class ParameterSyntaxError extends Error {
    constructor(msg) {
        super(msg);
    }
}

export class InfluxClient {
    queryApi = new InfluxDB({ url, token }).getQueryApi(org);

    /**
     * Converts nested where clause json object to filter expression 
     * @param {*} whereClauses 
     * @returns string
     */
    buildFilterExpression(whereClauses) {
        // logical operator
        if (Object.prototype.hasOwnProperty.call(whereClauses, "logicalOperator") &&
            Object.prototype.hasOwnProperty.call(whereClauses, "children")) {
            if (!validLogicalOperators.includes(whereClauses.logicalOperator)) {
                throw new ParameterSyntaxError("Invalid logical operator in where clause: " + whereClauses.logicalOperator);
            }
            let expr = "(";
            let op = whereClauses.logicalOperator;
            // TODO: add special case for NOT operator
            if (op === "not") {
                throw new Error("\"not\" operator not yet supported");
            }
            whereClauses.children.forEach((clause, i) => {
                expr += this.buildFilterExpression(clause);
                if (i < whereClauses.children.length - 1) expr += ` ${op} `;
            });
            expr += ")";
            return expr;
            // clause
        } else if (Object.prototype.hasOwnProperty.call(whereClauses, "attribute") &&
            Object.prototype.hasOwnProperty.call(whereClauses, "operator") &&
            Object.prototype.hasOwnProperty.call(whereClauses, "value")) {
            // sanitize / validate
            if (!validOperators.includes(whereClauses.operator)) {
                console.log(whereClauses.operator);
                throw new ParameterSyntaxError("Invalid operator in where clause: " + whereClauses.operator);
            }
            try {
                var value = toFluxValue(whereClauses.value);
                var attribute = toFluxValue(whereClauses.attribute);
            } catch (error) {
                throw new SanitizationError(error.message);
            }
            return `r[${attribute}] ${whereClauses.operator} ${value}`;
        } else {
            throw new ParameterSyntaxError("Where clauses query parameter not well formed");
        }
    }

    /**
     * Sanitize and validate input time from string query parameter
     * @param {string} time 
     * @returns sanitized time as number (in epoch seconds)
     */
    sanitizeTime(time) {
        let n = Number(time);
        if (isNaN(n) || n < 0) {
            throw new SanitizationError("Time must be a non-negative number");
        }
        return n;
    }

    /**
     * Query InfluxDB for the real-time vehicle positions with an optional filter expression
     * @param {string} filterExpr 
     * @returns json object with metadata and query result
     */
    async queryCurrentVehiclePositions(filterExpr = "true") {
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
        };
    }

    /**
     * Query InfluxDB for past vehicle positions with an optional filter expression
     * @param {string} filterExpr 
     * @returns json object with metadata and query result
     */
    async queryPastVehiclePositions(time, filterExpr = "true") {
        let sanitizeTime = this.sanitizeTime(time);
        let fluxQuery = `
        from(bucket: "RTD-GTFS-NEW")
            |> range(start: ${sanitizeTime - 300}, stop: ${sanitizeTime})
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
        };
    }

    /**
     * Query InfluxDB for vehicle positions over a time interval with an optional filter expression
     * @param {number} timeStart start of time interval
     * @param {number} timeEnd end of time interval 
     * @param {string} filterExpr 
     * @returns 
     */
    async queryIntervalVehiclePositions(timeStart, timeEnd, filterExpr = "true") {
        let sanitizedTimeStart = this.sanitizeTime(timeStart);
        let sanitizedTimeEnd = this.sanitizeTime(timeEnd);
        let fluxQuery = `
        from(bucket: "RTD-GTFS-NEW")
            |> range(start: ${sanitizedTimeStart}, stop: ${sanitizedTimeEnd})
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
        };
    }

}
