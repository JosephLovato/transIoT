import { Component } from '@angular/core';
import { LayersService } from '../layers.service';
import { DataService } from '../data.service';
import { Subscription, lastValueFrom } from 'rxjs';
import { RawDataLayer } from '../layer-types';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { LayerType, Query, QueryType } from '../query/query';
import { query } from 'express';
import { MatDialog } from '@angular/material/dialog';
import { EditLayerDialogComponent } from './edit-layer-dialog/edit-layer-dialog.component';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.css']
})
export class LayersComponent {
  private newLayerSub: Subscription;
  public layersByQuery: Query[] = [];

  colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff"
  ]
  colors_sequence = 0;

  constructor(
    private dataService: DataService,
    private layersService: LayersService,
    private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.newLayerSub.unsubscribe();
  }

  ngOnInit(): void {
    this.newLayerSub = this.dataService.newLayers$
      .subscribe((layer: RawDataLayer) => {
        // set color
        layer.query.color = this.colors[this.colors_sequence]
        this.colors_sequence = (this.colors_sequence + 1) % this.colors.length;
        // send to appropriate layers service function to be saved and rendered as an esri layer
        switch (layer.query.layerType) {
          case LayerType.Point:
            switch (layer.query.type) {
              case QueryType.VehiclePosition:
                this.layersService.addVehiclePositionPointLayer(layer);
            }
            break;
          case LayerType.Line:
            break;
          default:
            throw (`Layer type not support by layers service: ${layer.query.layerType}`)
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
    this.layersService.toggleLayerVisibility(query.id)
  }

  changeColor(query: Query) {
    this.layersService.changeLayerColor(query.id, query.color);
  }

  deleteLayer(query: Query) {
    if (confirm("This action cannot be undone. Are you sure you want to delete this layer?")) {
      this.layersService.deleteLayer(query.id);
      this.layersByQuery = this.layersByQuery.filter(l => l != query);
    }
  }

  async editLayer(query: Query) {
    console.log("[<Layers>]: editing layer: ", query.id);
    // open dialog to edit
    const dialogRef = this.dialog.open(EditLayerDialogComponent, {
      width: '30%',
      data: query
    });
    // wait for dialog to return the edited node
    query = await lastValueFrom<Query>(dialogRef.afterClosed());
  }

}
