import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Dialog, DialogRef } from '@angular/cdk/dialog'
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ClauseNode, LogicalOperator, Operator, WhereClause } from '../../query/where-clauses';
import { DataService } from 'src/app/data.service';
import { Observable, catchError, throwError } from 'rxjs';
import { WhereClauseDialog } from '../components/where-clause-dialog/where-clause-dialog.component';
import { dialogflow_v2beta1 } from 'googleapis';
import { LayerType } from 'src/app/query/query';
import { BusStopsQuery } from './bus-stops-query.model';
import { LayersService } from 'src/app/layers.service';

@Component({
  selector: 'app-bus-stops',
  templateUrl: './bus-stops.component.html',
  styleUrls: ['./bus-stops.component.css']
})
export class BusStopsComponent implements OnInit {
  sequence = 1;
  submitted = false;
  whereClausesPresent = false;
  refresh: number = 0;
  queryForm!: FormGroup;
  attributes: any;

  constructor(
    private fb: FormBuilder,
    private layersService: LayersService
  ) { }


  async ngOnInit(): Promise<void> {
    this.initializeForm();
    let bsq = await BusStopsQuery.build();
    this.attributes = bsq.attributes;
    this.submitted = false;
    this.whereClausesPresent = false;
  }

  initializeForm() {
    this.queryForm = this.fb.group({
      whereClauses: new ClauseNode()
    });
  }


  onSubmit() {
    this.submitted = true;
    // build query object from form
    var query: BusStopsQuery =
      new BusStopsQuery(this.queryForm.value as any, this.sequence);
    this.sequence++;

    // null-out where clauses if not present
    if (!this.whereClausesPresent) {
      query.whereClauses = null;
    }
    console.info("[Bus-Stops-Component] Submitting query: ", query)

    // call layers service to execute query
    this.layersService.addArcGISFeatureLayer(query);

  }

  onAddClauses() {
    this.whereClausesPresent = true;
  }

  rootNodeDeleted() {
    this.whereClausesPresent = false;
  }

}

