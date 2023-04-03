import { Component } from '@angular/core';
import { LayersService } from '../layers.service';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs';
import { RawDataLayer } from '../layer-types';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LayerType, Query, QueryType } from '../query';
import { query } from 'express';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.css']
})
export class LayersComponent {
  private newPbLayerSub$: Subscription;
  public layersByQuery: Query[] = [];

  colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff"
  ]
  colors_sequence = 0;

  constructor(
    private dataService: DataService,
    private layersService: LayersService) { }

  ngOnDestroy(): void {
    this.newPbLayerSub$.unsubscribe();
  }

  ngOnInit(): void {
    this.newPbLayerSub$ = this.dataService.newLayers$
      .subscribe((layer: RawDataLayer) => {
        // set color
        layer.query.color = this.colors[this.colors_sequence]
        this.colors_sequence = (this.colors_sequence + 1) % this.colors.length;
        // send to appropriate layers service function to be saved and rendered as an esri layer
        switch(layer.query.layerType) {
          case LayerType.Point:
            switch(layer.query.type) {
              case QueryType.VehiclePosition:
                this.layersService.addVehiclePositionPointLayer(layer);
            }
            break;
          case LayerType.Line:
            break;
          default:
            throw(`Layer type not support by layers service: ${layer.query.layerType}`)
        }

        // save here to be displayed
        this.layersByQuery.push(layer.query);
      })
    this.dataService.newLayers$.subscribe()
  }



  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.layersByQuery, event.previousIndex, event.currentIndex);
  }

  toggleVisibility(query: Query) {
    query.visible = !query.visible;
    this.layersService.toggleVisibility(query.id)
  }

  changeColor(query: Query) {
    this.layersService.changeColor(query.id, query.color);
  }

}
