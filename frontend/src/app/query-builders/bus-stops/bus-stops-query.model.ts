import { ArcGISFeatureQuery } from 'src/app/query/arcgis-query';
import { LayerType, QueryType } from 'src/app/query/query';

export class BusStopsQuery extends ArcGISFeatureQuery {
    protected override _url: string = 'https://services5.arcgis.com/1fZoXlzLW6FCIUcE/ArcGIS/rest/services/RTD_GIS_Current_Runboard/FeatureServer/2';

    public constructor(init?: Partial<BusStopsQuery>, sequence?: number) {
        super();
        Object.assign(this, init);
        this.name = `Bus Stops Query (${sequence})`;
        this._type = QueryType.BusStops;
        this.layerType = LayerType.Point;
        this.webStyleSymbolName = "bus-station";
        this.popupTemplateTitleField = 'STOPNAME';
    }

    view(): string {
        return this.name;
    }

    // used to initialize static variables. Must be called before use of class
    static async build() {
        const query = new BusStopsQuery();
        await query.fetchLayer();
        await query.populateAttributes();
        return query;
    }

}

