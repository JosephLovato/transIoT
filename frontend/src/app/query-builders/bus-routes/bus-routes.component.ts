import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LayersService } from 'src/app/layers.service';
import { BusRoutesQuery } from './bus-routes-query.model';
import { ClauseNode } from 'src/app/query/where-clauses';

@Component({
  selector: 'app-bus-routes',
  templateUrl: './bus-routes.component.html',
  styleUrls: ['./bus-routes.component.css']
})
export class BusRoutesComponent implements OnInit {
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
    let brq = await BusRoutesQuery.build();
    this.attributes = brq.attributes;
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
    var query: BusRoutesQuery =
      new BusRoutesQuery(this.queryForm.value as any, this.sequence);
    this.sequence++;

    // null-out where clauses if not present
    if (!this.whereClausesPresent) {
      query.whereClauses = null;
    }
    console.info("[Bus-Routes-Component] Submitting query: ", query)

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
