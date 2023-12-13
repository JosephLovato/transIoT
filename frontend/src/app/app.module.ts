import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider'
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTreeModule } from '@angular/material/tree'
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatMenuModule } from '@angular/material/menu'
import { MatAutocompleteModule } from '@angular/material/autocomplete';


import { ColorPickerModule } from 'ngx-color-picker';


import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';

import { AppComponent } from './app.component';
import { EsriMapComponent } from './esri-map/esri-map.component';
import { VehiclePositionComponent } from './query-builders/vehicle-position/vehicle-position.component';
import { LayersComponent } from './layers/layers.component';
import { WhereClauseDialogComponent } from './query-builders/components/where-clause-dialog/where-clause-dialog.component';
import { ClauseTreeComponent } from './query-builders/components/clause-tree/clause-tree.component';
import { EditLayerDialogComponent } from './layers/edit-layer-dialog/edit-layer-dialog.component';
import { BusStopsComponent } from './query-builders/bus-stops/bus-stops.component';
import { BusRoutesComponent } from './query-builders/bus-routes/bus-routes.component';

@NgModule({
  declarations: [
    AppComponent,
    EsriMapComponent,
    VehiclePositionComponent,
    LayersComponent,
    ClauseTreeComponent,
    WhereClauseDialogComponent,
    EditLayerDialogComponent,
    BusStopsComponent,
    BusRoutesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatTabsModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    MatGridListModule,
    MatSelectModule,
    MatIconModule,
    MatDividerModule,
    MatTreeModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatAutocompleteModule,
    DragDropModule,
    ScrollingModule,
    ColorPickerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
