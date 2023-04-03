import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Dialog, DialogRef } from '@angular/cdk/dialog'
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { VehiclePositionQuery, vehiclePositionAttributes } from './vehicle-positition-query.model';
import { ClauseNode, LogicalOperator, Operator, WhereClause } from '../../where-clauses';
import { DataService } from 'src/app/data.service';
import { Observable, catchError, throwError } from 'rxjs';
import { WhereClauseDialog } from '../where-clause-dialog/where-clause-dialog.component';
import { dialogflow_v2beta1 } from 'googleapis';
import { LayerType } from 'src/app/query';

@Component({
  selector: 'app-vehicle-position',
  templateUrl: './vehicle-position.component.html',
  styleUrls: ['./vehicle-position.component.css']
})
export class VehiclePositionComponent implements OnInit {

  sequence = 1;
  submitted = false;
  queryForm!: FormGroup;
  attributes = vehiclePositionAttributes;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
  ) {
  }


  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.queryForm = this.fb.group({
      now: true,
      timeInterval: this.fb.group({
        start: new FormControl<Date | null>(null),
        end: new FormControl<Date | null>(null)
      }),
      whereClauses: new FormControl<ClauseNode | null>(null)
    })
  }


  onSubmit() {
    this.submitted = true;
    // build query object from form
    var query: VehiclePositionQuery =
      new VehiclePositionQuery(this.queryForm.value as any, this.sequence);
    this.sequence++;
    
    // set layer type based on user's time input
    query.layerType = (query.now || !query.range) ? LayerType.Point : LayerType.Line;

    console.info("[Vehicle-Position-Component] Submitting query: ", query)

    // call data service to fetch query
    this.dataService.getData(query)
      .pipe(catchError(err => {
        this.sequence--;
        return new Observable();
      })).subscribe(_ => true);

    // reset form
    this.initializeForm();
  }

  onAddClauses() {
    this.queryForm.get('whereClauses')?.setValue(new ClauseNode);
  }

}
