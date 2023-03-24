'use strict'
/** @module influx-client 
 * Queries a data point in InfluxDB using the Javascript client library with Node.js.
**/

import { InfluxDB, Point } from '@influxdata/influxdb-client'

/** Environment variables **/
const url = "http://localhost:8086"
const token = process.env.INFLUX_TOKEN
const org = "rtd-local"

/**
 * Instantiate the InfluxDB client
 * with a configuration object.
**/
const queryApi = new InfluxDB({ url, token }).getQueryApi(org)


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
myQuery()