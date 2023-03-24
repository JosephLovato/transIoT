// Query for the most recent position data of vehicle 1503
// notes: 
// - the first filter line filters down to only vehicle 1503
// - the second filter line grabs the fields we care about 
// - the pivot line helps to get all data into one "row"
// - the group line puts all of the same vehicle together in sub-table (relevant for grabing ranges)
// - the max line finds the most recent entry for the vehicle
// - the drop line drops unneeded rows
from(bucket: "RTD-GTFS")
  |> range(start: -5m, stop: now())
  |> filter(fn: (r) => r["vehicle_id"] == "1503")
  |> filter(fn: (r) => r["_field"] == "bearing" or r["_field"] == "latitude" or r["_field"] == "longitude")
  |> pivot(columnKey: ["_field"], rowKey: ["_time", "vehicle_id"], valueColumn: "_value")
  |> group(columns: ["vehicle_id"])
  |> max(column: "_time") 
  |> drop(columns: ["_start", "_stop", "_measurement"])
