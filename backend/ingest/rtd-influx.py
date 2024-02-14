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
import os
import filecmp
import time
import logging
from dotenv import load_dotenv
# influx
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
# gtfs realtime
from google.transit import gtfs_realtime_pb2 as gtfs
# url requesting
import urllib3

sample_rate = 40
ingest_count = 0

# Setup Influx API
load_dotenv()
token = os.getenv("INFLUX_TOKEN")
org = "rtd-local"
bucket = "RTD-GTFS-NEW"
url = "http://localhost:8086"

# Setup temp file
f = open("tmp-prev.pb", "w")
f.close()

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("logs/rtd-influx.log"),
        logging.StreamHandler()
    ]
)


def ingest_to_influx(data):
    '''Ingest all data from the protobuf file fetched from RTD's restful API'''
    global ingest_count
    feed = gtfs.FeedMessage()
    feed.ParseFromString(data)
    with InfluxDBClient(url=url, token=token, org=org) as client:
        write_api = client.write_api(write_options=SYNCHRONOUS)
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
    try:
        response = urllib3.request('GET', 'https://www.rtd-denver.com/files/gtfs-rt/VehiclePosition.pb', headers={'User-Agent': 'Mozilla/5.0'})
    except:
        logging.error("Error in fetching data from RTD. Continuing...")
        time.sleep(sample_rate)
        continue
    
    with open("tmp-now.pb", mode="wb") as html_file:
        html_file.write(response.data)

    # If the protobuffer has new data, ingest to influxdb
    same = filecmp.cmp("tmp-prev.pb", "tmp-now.pb")
    if(not same):
        try:
            ingest_to_influx(response.data)
        except:
            logging.error("Error in injecting. Continuing...")
    else:
        logging.info("Data did not change... continuing")
    # Move current file to previous for next comparison
    os.rename("tmp-now.pb", "tmp-prev.pb")

    time.sleep(sample_rate)
