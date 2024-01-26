import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {EnvService} from "../utils/sharedMethods/env/env.service";

@Injectable({
  providedIn: 'root'
})
export class EstadoCuentaService {

  private _refreshNeeded = new Subject<void>();
  private apiUrl =  `${this.env.getUrl()}/estado-cuenta`;

  get refreshNeeded(){
    return this._refreshNeeded
  }
  constructor(private http : HttpClient, private env : EnvService) { }

  //GET TODOS LOS ESTADOS DE CUENTA
  getEstadoCuenta() : Observable<any>{
    return this.http.get(`${this.apiUrl}s`);
  }
}
