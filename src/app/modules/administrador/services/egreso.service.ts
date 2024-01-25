import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, Subject, tap} from "rxjs";
import {Egreso} from "../interfaces/egreso";

@Injectable({
  providedIn: 'root'
})
export class EgresoService {

  constructor(private http : HttpClient) { }

  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }

  private apiUrl = 'http://localhost:8090/api/v1/egreso';

  //Crear egreso
  crearEgreso(egreso : Egreso) : Observable<any>{
    return this.http.post(this.apiUrl, egreso)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      )
  }

  //obtener egresos paginados filtrados por fecha
  getEgresoPageableByFecha(fechaInicio : string, fechaFin : string | null,
                           numeroPagina: number, tamanoPagina: number,
                           order : string, asc : boolean) : Observable<any>{
    let params : HttpParams = new HttpParams()
      .set('page', numeroPagina.toString())
      .set('size', tamanoPagina.toString())
      .set('order', order)
      .set('asc', asc);

    let headers: HttpHeaders = new HttpHeaders()
      .set('fechaInicio', new Date(fechaInicio).toISOString());

    if (fechaFin != null) {
      headers = headers.set('fechaFin', new Date(fechaFin).toISOString());
    }

    return this.http.get(`${this.apiUrl}s-page/fecha`, {headers, params})
  }
}
