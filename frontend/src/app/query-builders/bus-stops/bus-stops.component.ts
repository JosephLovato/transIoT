import { Component, OnInit } from '@angular/core';
import { BusStopsQuery } from './bus-stops-query.model'
import { Attributes } from 'src/app/query/query';

@Component({
  selector: 'app-bus-stops',
  templateUrl: './bus-stops.component.html',
  styleUrls: ['./bus-stops.component.css']
})
export class BusStopsComponent implements OnInit {
  attributes: any;

  async ngOnInit(): Promise<void> {
    let bsq = await BusStopsQuery.build();
    this.attributes = bsq.attributes;
    console.log(this.attributes);
  }
}
