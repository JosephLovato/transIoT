import { Attributes, Query } from './query';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import uniqueValues from '@arcgis/core/smartMapping/statistics/uniqueValues'

export abstract class ArcGISFeatureQuery extends Query {
    protected abstract _url: string;
    public static featureLayer: FeatureLayer;
    // this allows us to access the overridden static member of derived classes
    public override derivedClass = (this.constructor as typeof ArcGISFeatureQuery);

    override async populateAttributes() {
        let attrs: Attributes = {};
        this.derivedClass.featureLayer.fields.forEach(async field => {
            let unique = await uniqueValues({
                layer: this.derivedClass.featureLayer,
                field: field.name
            })
            let possVals: { [key: string | number]: string | number } = {};
            unique.uniqueValueInfos.forEach(info => {
                possVals[info.value] = info.value
            })
            attrs[field.name] = {
                name: field.name,
                type: field.type,
                possibleValues: possVals
            }
        });
        this.derivedClass._attributes = attrs;
    }

    async fetchLayer() {
        // fetch full feature layer on static initialization
        let f = new FeatureLayer({
            url: this.url,
            outFields: ["*"]
        })
        await f.load();
        this.derivedClass.featureLayer = f;
    }

    public get url(): string { return this._url };

}