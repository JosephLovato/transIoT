import { Component, OnInit } from '@angular/core';
import { VehiclePositionQuery } from './vehicle-positition-query.model';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Operators, WhereClause } from '../../where-clauses';
import { DataService } from 'src/app/data.service';
import { catchError, throwError } from 'rxjs';
import { isStringLiteral } from 'typescript';

@Component({
  selector: 'app-vehicle-position',
  templateUrl: './vehicle-position.component.html',
  styleUrls: ['./vehicle-position.component.css']
})
export class VehiclePositionComponent implements OnInit {

  attributes = [
    { name: 'trip_id', type: 'string', possibleValues: undefined },
    { name: 'route_id', type: 'string', possibleValues: undefined },
    { name: 'direction_id',  type: 'string', possibleValues: undefined },
    {
      name: 'schedule_relationship', type: 'select',
      possibleValues: [] = [
        { key: 'SCHEDULED', value: 'SCHEDULED' },
        { key: 'ADDED', value: 'ADDED' },
        { key: 'CANCELED', value: 'CANCELED' }]
    },
    { name: 'vehicle_id', type: 'string', possibleValues: undefined },
    { name: 'vehicle_label',  type: 'string', possibleValues: undefined },
    { name: 'latitude', type: 'number', possibleValues: undefined },
    { name: 'longitude', type: 'number', possibleValues: undefined },
    { name: 'bearing', type: 'number', possibleValues: undefined },
    { name: 'stop_id', type: 'string', possibleValues: undefined },
    {
      name: 'current_status', key: 'number', type: 'select',
      possibleValues: [
        { key: 'INCOMING_AT', value: 0 },
        { key: 'STOPPED_AT', value: 1 },
        { key: 'IN_TRANSIT_TO', value: 2 }]
    }
  ];

  whereOps = Object.values(Operators)
  sequence = 1;
  submitted = false;
  queryForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService
  ) { }

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
      whereClauses: this.fb.array([])
    })
  }

  get whereClauses(): FormArray {
    return this.queryForm.get('whereClauses') as FormArray;
  }

  newWhereClause() {
    return this.fb.group({
      attribute: '',
      operator: '',
      key: ''
    })
  }

  addWhereClause() {
    this.whereClauses.push(this.newWhereClause());
  }

  removeWhereClause(i: number) {
    this.whereClauses.removeAt(i);
  }

  onSubmit() {
    this.submitted = true;

    // build query object from form
    var query: VehiclePositionQuery =
      new VehiclePositionQuery(this.queryForm.value as any, this.sequence);
    console.debug(query);
    this.sequence++;
    // call data service to fetch query
    this.dataService.getData(query)
      .pipe(catchError(err => {
        console.log('HERE');
        this.sequence--;
        return throwError(() => err)
      })).subscribe(_ => console.log('hi'));


    // reset form
    this.initializeForm();
  }


}
