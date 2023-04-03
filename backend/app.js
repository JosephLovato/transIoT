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

// app.post('/api/posts', (req, res, next) => {
//     const post = req.body;
//     console.log(post);
//     res.status(201).json({
//         message: 'Post added successfully`'
//     });
// })

app.get("/api/realtime/vehicle_position", async (req, res, next) => {
    try {
        let client = new InfluxClient();
        let filterExpr = 'true';
        if (req.query.whereClauses != undefined) {
            filterExpr = client.buildFilterExpression(req.query.whereClauses);
        }
        res.status(201).send(await client.queryCurrentVehiclePosition(filterExpr));
    } catch (error) {
        console.error(error)
        res.status(500).send("An error occurred while fetching the vehicle position proto buffer from the RTD real-time API");
    }
});

// module.exports = app;
export {
    app
}