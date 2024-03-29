import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import { LayersService } from '../layers.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit, OnDestroy {
  public view: MapView;
  private addLayerSub$: Subscription;
  private removeLayerSub$: Subscription;

  constructor(
    private layersService: LayersService
  ) { }

  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;


  initializeMap(): Promise<unknown> {
    const container = this.mapViewEl.nativeElement;

    const webmap = new WebMap({
      basemap: 'streets-navigation-vector'
    });

    const view = new MapView({
      container,
      map: webmap,
      center: [-105.020957, 39.754299],
      zoom: 10
    })

    this.view = view;
    return this.view.when();
  }

  ngOnInit(): void {
    this.initializeMap().then(() => {
      console.log("[Esri-Map-Component] Initialized Map");
    })
    this.addLayerSub$ = this.layersService.addLayerToMap$
      .subscribe((id: string) => {
        const layer = this.layersService.getLayer(id)
        if (layer) {
          this.view.map.add(layer);
        } else {
          console.error("[Esri-Map-Component] Cannot find layer in Layers-Service to add")
        }
      });
    this.removeLayerSub$ = this.layersService.removeLayerFromMap$
      .subscribe((id: string) => {
        const layer = this.layersService.getLayer(id)
        if (layer) {
          this.view.map.remove(layer);
        } else {
          console.error("[Esri-Map-Component] Cannot find layer in Layers-Service to remove")
        }
      })
  }

  ngOnDestroy(): void {
    if (this.view) {
      this.view.destroy();
    }
  }

}

// ngOnDestroy(): void {
//   this.newLayerSub$.unsubscribe();
// }
// ngOnInit(): void {
//   this.newLayerSub$ = this.dataService.newLayers$
//     .subscribe((layer: RawDataLayer) => {
//       this.layersService.addLayerFromRaw(layer);
//     })
// }
