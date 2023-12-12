// const express = require('express');
// const bodyparser = require('body-parser')
import express from 'express';
import bodyparser from 'body-parser'

import { InfluxClient } from './influx-client.js';

const app = express();

app.use(bodyparser.json())

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS");
    next();
})

app.get("/api/vehicle_position/current", async (req, res, next) => {
    try {
        let client = new InfluxClient();
        let filterExpr = 'true';
        if (req.query.whereClauses != undefined) {
            filterExpr = client.buildFilterExpression(JSON.parse(req.query.whereClauses));
        }
        res.status(201).send(await client.queryCurrentVehiclePositions(filterExpr));
        console.log("Current Vehicle Position Query: success");
    } catch (error) {
        console.error(error)
        res.status(500).send("An error occurred while fetching the current vehicle position data from influx");
        console.log("Current Vehicle Position Query: error");
    }
});


app.get("/api/vehicle_position/past", async (req, res, next) => {
    try {
        let client = new InfluxClient();
        let filterExpr = 'true';
        if (req.query.whereClauses != undefined) {
            filterExpr = client.buildFilterExpression(JSON.parse(req.query.whereClauses));
        }
        res.status(201).send(await client.queryPastVehiclePositions(req.query.pastTime, filterExpr));
        console.log("Past Vehicle Position Query: success");
    } catch (error) {
        console.error(error)
        res.status(500).send("An error occurred while fetching the past vehicle position data from influx");
        console.log("Past Vehicle Position Query: error");
    }
});

app.get("/api/vehicle_position/interval", async (req, res, next) => {
    try {
        let client = new InfluxClient();
        let filterExpr = 'true';
        if (req.query.whereClauses != undefined) {
            filterExpr = client.buildFilterExpression(JSON.parse(req.query.whereClauses));
        }
        res.status(201).send(await client.queryIntervalVehiclePositions(req.query.startTime, req.query.endTime, filterExpr));
        console.log("Interval Vehicle Position Query: success");
    } catch (error) {
        console.error(error)
        res.status(500).send("An error occurred while fetching the interval vehicle position data from influx");
        console.log("Interval Vehicle Position Query: error");
    }
});

export {
    app
}