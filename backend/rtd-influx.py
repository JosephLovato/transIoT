#!/usr/bin/env python3
""" Continuous script for scraping and ingesting realtime RTD vehicle position data
"""

__author__ = "Joey Lovato"
__version__ = "2.0.0"
__maintainer__ = "Joey Lovato"
__email__ = "joeylovato1@gmail.com"
__status__ = "Development"

#################
# -  IMPORTS  - #
#################

# general
from datetime import datetime
import os
import filecmp
import time
import sys
import logging
# influx
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
# gtfs realtime
from google.transit import gtfs_realtime_pb2 as gtfs
# url requesting
from urllib.request import Request, urlopen, urlretrieve

sample_rate = 40
ingest_count = 0

# Setup Influx API
# NOTE: Change these when deploying on AWS (or better yet, learn docker)
token = os.getenv("INFLUX_TOKEN")
org = "rtd-local"
bucket = "RTD-GTFS-NEW"
url = "http://localhost:8086"

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("logs/rtd-influx.log"),
        logging.StreamHandler()
    ]
)


def ingest_to_influx(req):
    '''Ingest all data from the protobuf file fetched into param:req from RTD's restful API'''
    global ingest_count
    feed = gtfs.FeedMessage()
    response = urlopen(req)
    feed.ParseFromString(response.read())
    with InfluxDBClient(url=url, token=token, org=org) as client:
        write_api = client.write_api(write_options=SYNCHRONOUS)
        count = 0
        points = []
        for entity in feed.entity:
            point = Point("vehicle_position") \
                .field("trip_id", entity.vehicle.trip.trip_id) \
                .tag("route_id", entity.vehicle.trip.route_id) \
                .tag("direction_id", entity.vehicle.trip.direction_id) \
                .tag("schedule_relationship", entity.vehicle.trip.schedule_relationship) \
                .tag("vehicle_id",  entity.vehicle.vehicle.id) \
                .tag("vehicle_label", entity.vehicle.vehicle.label) \
                .field("stop_id", entity.vehicle.stop_id) \
                .tag("current_status", entity.vehicle.current_status) \
                .time(entity.vehicle.timestamp, WritePrecision.S) \
                .field("latitude", entity.vehicle.position.latitude) \
                .field("longitude", entity.vehicle.position.longitude) \
                .field("bearing", entity.vehicle.position.bearing)
            points.append(point)
        write_api.write(bucket, org, points, write_precision=WritePrecision.S)
        ingest_count += 1
        logging.info("Ingested unique RTD data to %s: count = %d" %
                     (bucket, ingest_count))


while True:
    # Retrieve protobuf file via RTD's restful API
    req = Request('https://www.rtd-denver.com/files/gtfs-rt/VehiclePosition.pb',
                  headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(req) as response:
        body = response.read()
    with open("tmp-now.txt", mode="wb") as html_file:
        html_file.write(body)

    # If the protobuffer has new data, ingest to influxdb
    same = filecmp.cmp("tmp-prev.txt", "tmp-now.txt")
    if(not same):
        try:
            ingest_to_influx(req)
        except:
            logging.error("Error in injecting. Continuing...")

    # Move current file to previous for next comparison
    os.rename("tmp-now.txt", "tmp-prev.txt")

    time.sleep(sample_rate)
