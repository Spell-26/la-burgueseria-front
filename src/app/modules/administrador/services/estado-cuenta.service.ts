import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class EstadoCuentaService {

  private _refreshNeeded = new Subject<void>();
  private apiUrl = 'http://localhost:8090/api/v1/estado-cuenta';

  get refreshNeeded(){
    return this._refreshNeeded
  }
  constructor(private http : HttpClient) { }

  //GET TODOS LOS ESTADOS DE CUENTA
  getEstadoCuenta() : Observable<any>{
    return this.http.get(`${this.apiUrl}s`);
  }
}
