// const express = require('express');
// const bodyparser = require('body-parser')
import express from 'express';
import bodyparser from 'body-parser'

import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import fetch from 'node-fetch';

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
        const response = await fetch("https://www.rtd-denver.com/files/gtfs-rt/VehiclePosition.pb");
        if (!response.ok) {
            const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
            res.status(500).send("Error in fetching vehicle position proto buffer form RTD real-time API");
        } else {
            const buffer = await response.arrayBuffer();
            const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
                new Uint8Array(buffer)
            );
            res.status(201).json(feed.toJSON());
        }
    } catch (error) {
        console.error(error)
        res.status(500).send("An error occurred while fetching the vehicle position proto buffer from the RTD real-time API");
    }
});

// module.exports = app;
export {
    app
}