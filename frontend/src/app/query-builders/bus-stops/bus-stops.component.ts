import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClauseNode } from '../../query/where-clauses';
import { Attributes } from 'src/app/query/query';
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
  attributes: Attributes;

  constructor(
    private fb: FormBuilder,
    private layersService: LayersService
  ) { }


  async ngOnInit(): Promise<void> {
    this.initializeForm();
    const bsq = await BusStopsQuery.build();
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
    const query: BusStopsQuery =
      new BusStopsQuery(this.queryForm.value, this.sequence);
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

