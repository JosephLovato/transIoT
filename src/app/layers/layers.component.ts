import { Component } from '@angular/core';
import { LayersService } from '../layers.service';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs';
import { ProtoBufferLayer } from '../proto-buffer-layer.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Query } from '../query';

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
      .subscribe((layer: ProtoBufferLayer) => {
        // set color
        layer.query.color = this.colors[this.colors_sequence]
        this.colors_sequence = (this.colors_sequence + 1) % this.colors.length;
        // send to layers service to be saved and rendered as an esri layer
        this.layersService.addLayerFromRaw(layer);
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
