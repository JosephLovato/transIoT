import { InfluxQuery } from 'src/app/query/influx-query';
import { Attributes, QueryType } from 'src/app/query/query';

export const vehiclePositionAttributes: Attributes = {
    trip_id: { name: 'trip_id', type: 'string', possibleValues: {} },
    route_id: { name: 'route_id', type: 'string', possibleValues: {} },
    direction_id: { name: 'direction_id', type: 'string', possibleValues: {} },
    schedule_relationship: {
        name: 'schedule_relationship', type: 'string',
        possibleValues: {
            'SCHEDULED': 'SCHEDULED',
            'ADDED': 'ADDED',
            'CANCELED': 'CANCELED'
        }
    },
    vehicle_id: { name: 'vehicle_id', type: 'string', possibleValues: {} },
    vehicle_label: { name: 'vehicle_label', type: 'string', possibleValues: {} },
    latitude: { name: 'latitude', type: 'number', possibleValues: {} },
    longitude: { name: 'longitude', type: 'number', possibleValues: {} },
    bearing: { name: 'bearing', type: 'number', possibleValues: {} },
    stop_id: { name: 'stop_id', type: 'string', possibleValues: {} },
    current_status: {
        name: 'current_status', type: 'string',
        possibleValues: {
            'INCOMING_AT': '0',
            'STOPPED_AT': '1',
            'IN_TRANSIT_TO': '2'
        }
    }
};

export class VehiclePositionQuery extends InfluxQuery {
    temporalType: TemporalType;
    pastTime?: Date;
    timeInterval?: {
        start: Date,
        end: Date
    }
    static override _attributes = vehiclePositionAttributes;

    public constructor(init?: Partial<VehiclePositionQuery>, sequence?: number) {
        super();
        Object.assign(this, init);
        this.name = `Vehicle Position Query (${sequence})`;
        this._type = QueryType.VehiclePosition;
    }

    view(): string {
        return this.name;
    }
}

export enum TemporalType {
    Current = "current",
    Past = "past",
    Interval = "interval"
}



