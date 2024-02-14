// Query for the most recent position data of vehicle 1503
// notes: 
// - the pivot line helps to get all data into one "row"
// - the filter line filters by a boolean expression (can use any column) [must come after pivot! otherwise, the data is sitll in the _field row format]
// - the group line puts all of the same vehicle together in sub-table (relevant for grabing ranges)
// - the max line finds the most recent entry for the vehicle
// - the drop line drops unneeded rows
from(bucket: "RTD-GTFS-NEW")
  |> range(start: -5m, stop: now())
  |> pivot(columnKey: ["_field"], rowKey: ["_time", "vehicle_id"], valueColumn: "_value")
  |> filter(fn: (r) => r["stop_id"] == "22924")
  |> group(columns: ["vehicle_id"])
  |> max(column: "_time") 
  |> drop(columns: ["_start", "_stop", "_measurement"])


// attempt to convert some tags to fields 
from (bucket: "RTD-GTFS")
    |> range(start: -1y, stop: now())
    |> to(bucket: "RTD-GTFS-NEW", 
          timeColumn: "_time", 
          tagColumns: ["route_id", "direction_id","schedule_relationship","vehicle_id", "vehicle_label","current_status"], 
          fieldFn: (r) => ({"trip_id": r.trip_id, "stop_id": r.stop_id, "latitiude": r.latitiude, "longitude": r.longitude, "bearing": r.bearing}))
