import express from "express";
import bodyparser from "body-parser";
import log4js from "log4js";

import { InfluxClient, SanitizationError, ParameterSyntaxError } from "./influx-client.js";

const app = express();

// setup logger
const logLayout = {
    type: "pattern",
    pattern: "[%d] [APP] %[[%p]%] %m"
};
log4js.configure({
    appenders: {
        logs: { type: "file", filename: "logs/app.log", layout: logLayout },
        console: { type: "console", layout: logLayout }
    },
    categories: {
        default: { appenders: ["console", "logs"], level: "trace" }
    }
});
var logger = log4js.getLogger();
logger.level = "debug";

class MissingQueryParameter extends Error {
    constructor(msg) {
        super(msg);
    }
}

app.use(bodyparser.json());

app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS");
    next();
});

app.get("/api/vehicle_position/current", async (req, res) => {
    try {
        let client = new InfluxClient();
        let filterExpr = "true";
        if (req.query.whereClauses != undefined) {
            filterExpr = client.buildFilterExpression(JSON.parse(req.query.whereClauses));
        }
        res.status(201).send(await client.queryCurrentVehiclePositions(filterExpr));
        logger.info("Current Vehicle Position Query: success");
    } catch (error) {
        handleErrors(error, "Past Vehicle Position Query", res);
    }
});


app.get("/api/vehicle_position/past", async (req, res) => {
    try {
        if (req.query.pastTime === undefined) {
            throw MissingQueryParameter("Missing \"pastTime\" query parameter");
        }
        let client = new InfluxClient();
        let filterExpr = "true";
        if (req.query.whereClauses != undefined) {
            filterExpr = client.buildFilterExpression(JSON.parse(req.query.whereClauses));
        }
        res.status(201).send(await client.queryPastVehiclePositions(req.query.pastTime, filterExpr));
        logger.info("Past Vehicle Position Query: success");
    } catch (error) {
        handleErrors(error, "Past Vehicle Position Query", res);
    }
});

app.get("/api/vehicle_position/interval", async (req, res) => {
    try {
        if (req.query.startTime === undefined) {
            throw MissingQueryParameter("Missing \"startTime\" query parameter");
        }
        if (req.query.endTime === undefined) {
            throw MissingQueryParameter("Missing \"endTime\" query parameter");
        }
        let client = new InfluxClient();
        let filterExpr = "true";
        if (req.query.whereClauses != undefined) {
            filterExpr = client.buildFilterExpression(JSON.parse(req.query.whereClauses));
        }
        res.status(201).send(await client.queryIntervalVehiclePositions(req.query.startTime, req.query.endTime, filterExpr));
        logger.info("Interval Vehicle Position Query: success");
    } catch (error) {
        handleErrors(error, "Interval Vehicle Position Query", res);
    }
});

function convertErrorMessage(error) {
    if (error instanceof AggregateError) {
        return error.errors.map(e => e.message).toString();
    }
    return error.message;
}

/**
 * Handle errors that could occur while processing a call to this API
 * @param {Error} error 
 * @param {string} context name of specific API endpoint we are processing with
 * @param {Response} res
 */
function handleErrors(error, context, res) {
    if (error instanceof MissingQueryParameter) {
        res.status(400).send(error.message);
    } else if (error instanceof SanitizationError) {
        res.status(400).send(error.message);
    } else if (error instanceof ParameterSyntaxError) {
        res.status(400).send(error.message);
    } else {
        res.status(500).send("An error has occurred processing this request: " + convertErrorMessage(error));
    }
    logger.error(`${context} Error:`, convertErrorMessage(error));
}

export {
    app
};