import { Attributes, Query } from './query';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import uniqueValues from '@arcgis/core/smartMapping/statistics/uniqueValues'

export abstract class ArcGISFeatureQuery extends Query {
    protected abstract _url: string;
    public static featureLayer: FeatureLayer;
    // this allows us to access the overridden static member of derived classes
    public override derivedClass = (this.constructor as typeof ArcGISFeatureQuery);
    protected webStyleSymbolName: string = "circle-1";
    protected popupTemplateTitleField: string | undefined = undefined;

    override async populateAttributes() {
        const attrs: Attributes = {};
        this.derivedClass.featureLayer.fields.forEach(async field => {
            const unique = await uniqueValues({
                layer: this.derivedClass.featureLayer,
                field: field.name
            })
            const possVals: { [key: string | number]: string | number } = {};
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
        const f = new FeatureLayer({
            url: this.url,
            outFields: ["*"]
        })
        await f.load();
        this.derivedClass.featureLayer = f;
    }

    public get url(): string { return this._url }

    /**
     * Accessor for the base ArcGIS feature layer of this query
     * @returns FeatureLayer
     */
    public getFeatureLayer() {
        return this.derivedClass.featureLayer;
    }

    /**
     * Accessor for the WebStyleSymbol name
     * @returns string
     */
    public getWebStyleSymbolName() {
        return this.webStyleSymbolName;
    }

    /**
     * Accessor for the field to display as the Popup Template title
     * @returns string
     */
    public getPopupTemplateTitleField() {
        return this.popupTemplateTitleField;
    }

}