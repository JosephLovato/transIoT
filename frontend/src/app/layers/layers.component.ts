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
import { ArcGISFeatureQuery } from '../query/arcgis-query';
import { LayerView } from './layer-view.model';

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.css']
})
export class LayersComponent {
  private newRawDataLayerSub: Subscription;
  private newLayerServiceLayerSub: Subscription;
  public layerViews: LayerView[] = [];

  constructor(
    private dataService: DataService,
    private layersService: LayersService,
    private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.newRawDataLayerSub.unsubscribe();
  }

  ngOnInit(): void {
    // subscribe to raw data layers sent from the data service
    this.newRawDataLayerSub = this.dataService.newLayers$
      .subscribe((layer: RawDataLayer) => {
        // send to appropriate layers service function to be saved and rendered as an esri layer
        switch (layer.query.layerType) {
          case LayerType.Point:
            switch (layer.query.type) {
              case QueryType.VehiclePosition:
                this.layersService.addVehiclePositionPointLayer(layer);
            }
            break;
          case LayerType.Line:
            switch (layer.query.type) {
              case QueryType.VehiclePosition:
                this.layersService.addVehiclePositionLineLayer(layer);
            }
            break;
          default:
            throw (`Layer type not support by layers service: ${layer.query.layerType}`)
        }

        // save here to be displayed
        this.layerViews.push({ query: layer.query, selected: false });
      })
    this.dataService.newLayers$.subscribe(); // TODO: is this needed?

    // subscribe to queries sent from the layers service (static layers)
    this.newLayerServiceLayerSub = this.layersService.addLayerToLayersView$
      .subscribe((layer: Query) => {
        this.layerViews.push({ query: layer, selected: false });
      });

  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.layerViews, event.previousIndex, event.currentIndex);
  }

  toggleVisibility(layer: LayerView) {
    layer.query.visible = !layer.query.visible;
    this.layersService.toggleLayerVisibility(layer.query.id)
  }

  changeColor(layer: LayerView) {
    this.layersService.changeLayerColor(layer.query.id, layer.query.color);
  }

  deleteLayer(layer: LayerView) {
    if (confirm("This action cannot be undone. Are you sure you want to delete this layer?")) {
      this.layersService.deleteLayer(layer.query.id);
      this.layerViews = this.layerViews.filter(l => l != layer);
    }
  }

  async editLayer(layer: LayerView) {
    console.log("[<Layers>]: editing layer: ", layer.query.id);
    // open dialog to edit
    const dialogRef = this.dialog.open(EditLayerDialogComponent, {
      width: '30%',
      data: layer.query
    });
    // wait for dialog to return the edited node
    layer.query = await lastValueFrom<Query>(dialogRef.afterClosed());
  }

  /**
   * Number of layers currently selected
   * @returns number
   */
  numLayersSelected(): number {
    return this.layerViews.reduce((count, lv) => lv.selected ? count + 1 : count, 0);
  }

  /**
   * True if exactly two layers are currently selected
   * @returns boolean
   */
  exactlyTwoLayersSelected(): boolean {
    return this.numLayersSelected() == 2;
  }

  getSelectedLayers(): Query[] {
    return this.layerViews.filter((lv) => lv.selected).map((lv) => lv.query);
  }
}
