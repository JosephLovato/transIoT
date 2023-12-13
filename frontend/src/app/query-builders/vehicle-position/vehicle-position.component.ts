import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TemporalType, VehiclePositionQuery } from './vehicle-position-query.model';
import { ClauseNode } from '../../query/where-clauses';
import { DataService } from 'src/app/data.service';
import { Observable, catchError } from 'rxjs';
import { LayerType } from 'src/app/query/query';

@Component({
  selector: 'app-vehicle-position',
  templateUrl: './vehicle-position.component.html',
  styleUrls: ['./vehicle-position.component.css']
})
export class VehiclePositionComponent implements OnInit {
  sequence = 1;
  submitted = false;
  whereClausesPresent = false;
  refresh: number = 0;
  queryForm!: FormGroup;
  attributes = VehiclePositionQuery._attributes;
  temporalTypes = Object.values(TemporalType);

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
  ) {
  }


  ngOnInit(): void {
    this.initializeForm();
    this.submitted = false;
    this.whereClausesPresent = false;
  }

  initializeForm() {
    this.queryForm = this.fb.group({
      temporalType: TemporalType.Current,
      pastTime: new FormControl<Date | null>(null),
      timeInterval: this.fb.group({
        start: new FormControl<Date | null>(null),
        end: new FormControl<Date | null>(null)
      }),
      whereClauses: new ClauseNode()
    });
  }


  onSubmit() {
    this.submitted = true;
    // build query object from form
    const query: VehiclePositionQuery =
      new VehiclePositionQuery(this.queryForm.value, this.sequence);
    this.sequence++;

    // set layer type based on user's time input
    query.layerType = (query.temporalType == TemporalType.Interval) ? LayerType.Line : LayerType.Point;

    // null out where clauses if not present
    if (!this.whereClausesPresent) {
      query.whereClauses = null;
    }
    console.info("[Vehicle-Position-Component] Submitting query: ", query)

    // call data service to fetch query
    this.dataService.fetchVehiclePositionData(query)
      // catch any errors from the result of the query
      .pipe(catchError(() => {
        console.log("ERROR");
        this.sequence--;
        return new Observable();
      })).subscribe(() => {
        // if no errors, reinitialize and tell clause tree to refresh
        this.ngOnInit();
        this.refresh++;
      });


  }

  onAddClauses() {
    this.whereClausesPresent = true;
  }

  rootNodeDeleted() {
    this.whereClausesPresent = false;
  }

}
