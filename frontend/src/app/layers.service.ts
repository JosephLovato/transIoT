import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { DataService } from './data.service';
import { RawDataLayer } from './layer-types';
import Layer from '@arcgis/core/layers/Layer';
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer'
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import Graphic from '@arcgis/core/Graphic';
import GeometryProperties from '@arcgis/core/geometry/Point';
import Color from "@arcgis/core/Color.js";
import { VehiclePositionPoint } from './query-builders/vehicle-position/vehicle-positition-query.model';

@Injectable({
  providedIn: 'root'
})
export class LayersService {
  private layers: Map<string, Layer> = new Map<string, Layer>(); // stores actual layers (referenced by esri-map)

  /* *********************** */
  /*  Subject/Subscriptions  */
  /* *********************** */

  private addLayer = new Subject<string>();
  public addLayer$ = this.addLayer.asObservable();
  private removeLayer = new Subject<string>();
  public removeLayer$ = this.removeLayer.asObservable();

  getLayer(id: string) {
    return this.layers.get(id);
  }

  /* *************** */
  /* Layer Modifiers */
  /* *************** */

  changeLayerColor(id: string, color: string) {
    var l = this.layers.get(id);
    if (l instanceof FeatureLayer) {
      (((l as FeatureLayer).renderer as
        SimpleRenderer).symbol as
        SimpleMarkerSymbol).color = new Color(color);
    }
  }

  toggleLayerVisibility(id: string) {
    this.layers.get(id)!.visible = !this.layers.get(id)?.visible;
  }

  deleteLayer(id: string) {
    this.removeLayer.next(id);
  }

  /* *************** */
  /* Layer Ingesters */
  /* *************** */

  async addVehiclePositionPointLayer(layer: RawDataLayer) {
    // setup layer
    // TODO do this in a separate function
    const newLayer = new FeatureLayer({
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid"
        },
        {
          name: "time",
          alias: "time",
          type: "date"
        },
        {
          name: "trip_id",
          alias: "trip_id",
          type: "string"
        },
        {
          name: "route_id",
          alias: "route_id",
          type: "string"
        },
        {
          name: "direction_id",
          alias: "direction_id",
          type: "string"
        },
        {
          name: "schedule_relationship",
          alias: "schedule_relationship",
          type: "string"
        },
        {
          name: "vehicle_id",
          alias: "vehicle_id",
          type: "string"
        },
        {
          name: "vehicle_label",
          alias: "vehicle_label",
          type: "string"
        },
        {
          name: "latitude",
          alias: "latitude",
          type: "double"
        },
        {
          name: "longitude",
          alias: "longitude",
          type: "double"
        },
        {
          name: "bearing",
          alias: "bearing",
          type: "double"
        },
        {
          name: "stop_id",
          alias: "stop_id",
          type: "string"
        },
        {
          name: "current_status",
          alias: "current_status",
          type: "string"
        }
      ],
      objectIdField: "ObjectID",
      id: layer.query.time.getTime().toString(), // id of layer is time of query
      outFields: ["*"],
      geometryType: "point",
      renderer: new SimpleRenderer({
        symbol: new SimpleMarkerSymbol({
          style: "circle",
          color: layer.query.color,
          size: "10px", // pixels
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 1, // points
          }
        })
      }),
      popupTemplate: {
        title: "ID: {vehicle_id}",
        // content: popup_content_rt
      },
      source: []
    });

    // populate layer with data
    let data = layer.data.data as VehiclePositionPoint[];
    const graphics = data.map(x => {
      var point = {
        type: "point", // autocasts as new Polyline()
        latitude: x.latitude,
        longitude: x.longitude
      };
      var attributes;
      // this still exists because "supposedly" if the bus 
      // is not on a trip, its route_id, stop_id, and current_status are null
      if (x.trip_id === null || x.trip_id === undefined) {
        //console.log(locationObject);
        attributes = {
          time: new Date(x._time).getTime(),
          trip_id: x.trip_id,
          route_id: x.route_id,
          direction_id: x.direction_id,
          schedule_relationship: x.schedule_relationship,
          vehicle_id: x.vehicle_id,
          vehicle_label: x.vehicle_label,
          latitude: x.latitude,
          longitude: x.longitude,
          bearing: x.bearing,
          stop_id: x.stop_id,
          current_status: x.current_status,
          // route_id: "",
          // stop_id: "",
          // current_status: ""
        };
      } else {
        attributes = {
          time: new Date(x._time).getTime(),
          trip_id: x.trip_id,
          route_id: x.route_id,
          direction_id: x.direction_id,
          schedule_relationship: x.schedule_relationship,
          vehicle_id: x.vehicle_id,
          vehicle_label: x.vehicle_label,
          latitude: x.latitude,
          longitude: x.longitude,
          bearing: x.bearing,
          stop_id: x.stop_id,
          current_status: x.current_status,
        };
      }
      return new Graphic({
        geometry: point as GeometryProperties,
        attributes: attributes,
      });
    });
    // add graphics to layer
    await newLayer.applyEdits({ addFeatures: graphics });
    // save layer and tell map component to add the layer
    this.layers.set(newLayer.id, newLayer);
    this.addLayer.next(newLayer.id);
  }

}
