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
  private addLayerSub$: Subscription

  constructor(
    private layersService: LayersService
  ) { }

  @ViewChild('mapViewNode', { static: true }) private mapViewEl!: ElementRef;
  

  initializeMap(): Promise<any> {
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

  ngOnInit(): any {
    this.initializeMap().then(() => {
      console.log("[Esri-Map-Component] Initialized Map");
    })
    this.addLayerSub$ = this.layersService.addLayer$
      .subscribe((id: string) => {
        this.view.map.add(this.layersService.getLayer(id)!);
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
