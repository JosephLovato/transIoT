import { Query } from "./query";
import { transit_realtime } from "gtfs-realtime-bindings";

export interface ProtoBufferLayer {
    query: Query;
    feedMessage: transit_realtime.FeedMessage;
}