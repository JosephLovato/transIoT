import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, of, tap, throwError } from 'rxjs';
import { ProtoBufferLayer } from './proto-buffer-layer.model';
import { Query, QueryType } from './query';
import { transit_realtime } from 'gtfs-realtime-bindings';
import { HttpClient, HttpHeaders } from '@angular/common/http';

type FeedMessage = transit_realtime.FeedMessage;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private newLayers = new Subject<ProtoBufferLayer>();
  public newLayers$ = this.newLayers.asObservable();
  private baseUrl = "http://localhost:3000/api/realtime/"

  constructor(private http: HttpClient) { }

  getData(query: Query) {
    var url = this.baseUrl;
    switch (query.type) {
      case QueryType.VehiclePosition:
        url += "vehicle_position";
        break;
      default:
        throw Error(`Query type not support: ${query.type}`)
    }
    var url_with_params = new URL(url);
    // build and add where clause filters from NodeClause tree
    let result = query.whereClauses.toJson();
      url_with_params.searchParams.append('whereClauses', JSON.stringify(result));


    var obvs = this.http.get<FeedMessage>(url_with_params.toString())

    obvs.pipe(
      tap(_ => console.log("[Data-Service] Fetched vehicle position query from backend")),
      catchError(err => {
        return this.handleError(err, "getData");
      })
    ).subscribe(feed => {
      this.newLayers.next({
        query: query,
        feedMessage: feed
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
