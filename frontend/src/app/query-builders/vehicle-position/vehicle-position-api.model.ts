
export interface VehiclePositionPoint {
    _time: string;
    trip_id: string;
    route_id: string;
    direction_id: string;
    schedule_relationship: string;
    vehicle_id: string;
    vehicle_label: string;
    latitude: number;
    longitude: number;
    bearing: number;
    stop_id: string;
    current_status: string;
}

export interface VehiclePositionPointOnLine {
    time: string;
    latitude: number;
    longitude: number;
    route_id: string;
}

export interface VehiclePositionAPI {
    timeStamp: Date;
    numDataPoints: number;
    data: VehiclePositionPoint[];
}

export interface VehicleIntervalPositionsAPI {
    timeStamp: Date;
    data: Record<string, VehiclePositionPointOnLine[]>;
}

