import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Dialog, DialogRef } from '@angular/cdk/dialog'
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TemporalType, VehiclePositionQuery, vehiclePositionAttributes } from './vehicle-position-query.model';
import { ClauseNode, LogicalOperator, Operator, WhereClause } from '../../query/where-clauses';
import { DataService } from 'src/app/data.service';
import { Observable, catchError, throwError } from 'rxjs';
import { WhereClauseDialog } from '../where-clause-dialog/where-clause-dialog.component';
import { dialogflow_v2beta1 } from 'googleapis';
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
    var query: VehiclePositionQuery =
      new VehiclePositionQuery(this.queryForm.value as any, this.sequence);
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
      .pipe(catchError(err => {
        console.log("ERROR");
        this.sequence--;
        return new Observable();
      })).subscribe(result => {
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
