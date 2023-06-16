import { ArcGISFeatureQuery } from 'src/app/query/arcgis-query';
import { LayerType, QueryType } from 'src/app/query/query';

export class BusRoutesQuery extends ArcGISFeatureQuery {
    protected override _url: string = 'https://services5.arcgis.com/1fZoXlzLW6FCIUcE/ArcGIS/rest/services/RTD_GIS_Current_Runboard/FeatureServer/4'

    public constructor(init?: Partial<BusRoutesQuery>, sequence?: number) {
        super();
        Object.assign(this, init);
        this.name = `Bus Routes Query (${sequence})`;
        this._type = QueryType.BusRoutes;
        this.layerType = LayerType.Line;
        this.popupTemplateTitleField = 'NAME';
    }

    view(): string {
        return this.name;
    }

    // used to initialize static variables. Must be called before use of class
    static async build() {
        const query = new BusRoutesQuery();
        await query.fetchLayer();
        await query.populateAttributes();
        return query;
    }

}

