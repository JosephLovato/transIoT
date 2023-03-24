import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { DataService } from './data.service';
import { ProtoBufferLayer } from './proto-buffer-layer.model';
import Layer from '@arcgis/core/layers/Layer';
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer'
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import Graphic from '@arcgis/core/Graphic';
import GeometryProperties from '@arcgis/core/geometry/Point';
import Color from "@arcgis/core/Color.js";

@Injectable({
  providedIn: 'root'
})
export class LayersService {
  private layers: Map<string, Layer> = new Map<string, Layer>();

  private addLayer = new Subject<string>();
  public addLayer$ = this.addLayer.asObservable();
  private removeLayer = new Subject<string>();
  public removeLayer$ = this.removeLayer.asObservable();
  // private toggleVisibility

  getLayer(id: string) {
    return this.layers.get(id);
  }

  changeColor(id: string, color: string) {
    var l = this.layers.get(id);
    if (l instanceof FeatureLayer) {
      (((l as FeatureLayer).renderer as
        SimpleRenderer).symbol as
        SimpleMarkerSymbol).color = new Color(color);
    }
  }

  toggleVisibility(id: string) {
    this.layers.get(id)!.visible = !this.layers.get(id)?.visible;
  }

  addLayerFromRaw(layer: ProtoBufferLayer) {
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
          name: "name",
          alias: "name",
          type: "string"
        },
        {
          name: "timestamp",
          alias: "timestamp",
          type: "string"
        },
        {
          name: "route_id",
          alias: "route_id",
          type: "string"
        },
        {
          name: "stop_id",
          alias: "stop_id",
          type: "integer"
        },
        {
          name: "current_status",
          alias: "current_status",
          type: "integer"
        }
      ],
      objectIdField: "ObjectID",
      id: layer.query.time.getTime().toString(), // id of layer is
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
        title: "ID: {name}",
        // content: popup_content_rt
      },
      source: []
    });

    // populate layer with data
    const graphics = layer.feedMessage.entity.map(entity => {
      let vehicle = entity.vehicle!;
      var point = {
        type: "point", // autocasts as new Polyline()
        latitude: vehicle.position!.latitude,
        longitude: vehicle.position!.longitude
      };

      var timeStampDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
      timeStampDate.setUTCSeconds(vehicle.timestamp! as number);
      //console.log(locationObject);
      var attributes;
      if (vehicle.trip === null || vehicle.trip === undefined) {
        //console.log(locationObject);
        attributes = {
          name: vehicle.vehicle!.id,
          timestamp: timeStampDate.toTimeString(),
          route_id: -1,
          stop_id: -1,
          current_status: -1
        };
      } else {
        attributes = {
          name: vehicle.vehicle!.id,
          timestamp: timeStampDate.toTimeString(),
          route_id: vehicle.trip!.routeId,
          stop_id: vehicle.stopId,
          current_status: vehicle.currentStatus?.toString()
        };
      }

      return new Graphic({
        geometry: point as GeometryProperties,
        attributes: attributes,
      });
    });

    // add graphics to layer
    newLayer.applyEdits({ addFeatures: graphics })

    // save layer and tell map component to add the layer
    this.layers.set(newLayer.id, newLayer);
    this.addLayer.next(newLayer.id);
  }

  // updateLayer(featureLayer: FeatureLayer, feed: FeedMessage[]) {


  //   // Add all the locations to the map:
  //   const graphics = locations.map(locationObject => {
  //     var point = {
  //       type: "point", // autocasts as new Polyline()
  //       latitude: locationObject.vehicle.position.latitude,
  //       longitude: locationObject.vehicle.position.longitude
  //     };

  //     var timeStampDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
  //     timeStampDate.setUTCSeconds(locationObject.vehicle.timestamp);
  //     //console.log(locationObject);
  //     var attributes;
  //     if (locationObject.vehicle.trip === null) {
  //       //console.log(locationObject);
  //       attributes = {
  //         name: locationObject.vehicle.vehicle.id,
  //         timestamp: timeStampDate.toTimeString(),
  //         route_id: -1,
  //         stop_id: -1,
  //         current_status: -1
  //       };
  //     } else {
  //       attributes = {
  //         name: locationObject.vehicle.vehicle.id,
  //         timestamp: timeStampDate.toTimeString(),
  //         route_id: locationObject.vehicle.trip.route_id,
  //         stop_id: locationObject.vehicle.stop_id,
  //         current_status: locationObject.vehicle.current_status
  //       };
  //     }

  //     return new Graphic({
  //       geometry: point,
  //       attributes: attributes,
  //     });
  //   });

  //   // first clear out the graphicsLayer
  //   // console.log('featureLayer:', featureLayer);
  //   await layerView.queryFeatures().then(async (results) => {
  //     await featureLayer.applyEdits({
  //       deleteFeatures: results.features,
  //       addFeatures: graphics
  //     });
  //     console.log("UPDATE deleted:", results.features);
  //   });

  // };



}
