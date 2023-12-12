import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, of, tap, throwError } from 'rxjs';
import { Query, QueryType } from './query/query';
import { transit_realtime } from 'gtfs-realtime-bindings';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TemporalType, VehiclePositionPoint, VehiclePositionQuery } from './query-builders/vehicle-position/vehicle-position-query.model';
import { RawDataLayer } from './layer-types';

type FeedMessage = transit_realtime.FeedMessage;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private newLayers = new Subject<RawDataLayer>();
  public newLayers$ = this.newLayers.asObservable();
  private baseUrl = "http://localhost:3000/api/vehicle_position/"

  constructor(private http: HttpClient) { }

  fetchVehiclePositionData(query: VehiclePositionQuery) {
    var url = this.baseUrl + query.temporalType;
    var url_with_params = new URL(url);

    // build and add where clause filters
    if (query.whereClauses != null) {
      let result = query.whereClauses.toJson();
      url_with_params.searchParams.append('whereClauses', JSON.stringify(result));
    }

    // add time parameters
    switch (query.temporalType) {
      case TemporalType.Past:
        url_with_params.searchParams.append('pastTime', (query.pastTime!.getTime() / 1000).toFixed(0).toString());
        break;
      case TemporalType.Interval:
        url_with_params.searchParams.append('startTime', (query.timeInterval!.start.getTime() / 1000).toFixed(0).toString());
        url_with_params.searchParams.append('endTime', (query.timeInterval!.end.getTime() / 1000).toFixed(0).toString());
    }


    var obvs = this.http.get<any>(url_with_params.toString())

    obvs.pipe(
      tap(_ => console.log(`[Data-Service] Fetched Vehicle Position query from backend (${url_with_params.toString()})`)),
      catchError(err => {
        return this.handleError(err, "getData");
      })
    ).subscribe(response => {
      this.newLayers.next({
        query: query,
        data: response
      });
    });
    return obvs;

  }

  private handleError(error: Error, operation: string): Observable<FeedMessage> {
    alert("An error has occurred while fetching your query. Please try again.")
    console.error(`[Data-Service] Error on operation (${operation})`, error.message)
    return throwError(() => error);
  }

}
